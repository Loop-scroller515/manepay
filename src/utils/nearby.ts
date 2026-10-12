import { useEffect, useRef, useState } from 'react';

const TOPIC = 'manepay-nearby-loop';
const SOCKET = `wss://ntfy.sh/${TOPIC}/ws`;
const POST = `https://ntfy.sh/${TOPIC}`;

export type NearbyPhone = { id: string; name: string; seen: number };

type HereMsg = { t: 'here'; id: string; name: string };
type PayMsg = { t: 'pay'; to: string; id: string; a: number; from: string };

function deviceId() {
  const key = 'manepay_device_id';
  try {
    const saved = localStorage.getItem(key);
    if (saved) return saved;
    const created = Math.random().toString(36).slice(2, 10);
    localStorage.setItem(key, created);
    return created;
  } catch {
    return 'phone';
  }
}

export async function publish(body: HereMsg | PayMsg) {
  const response = await fetch(POST, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Could not reach the other phone.');
}

export function useNearby(
  name: string,
  onPayment: (payment: { amount: number; from: string; id: string }) => void,
) {
  const [peers, setPeers] = useState<NearbyPhone[]>([]);
  const [scanning, setScanning] = useState(true);
  const onPaymentRef = useRef(onPayment);
  onPaymentRef.current = onPayment;
  const idRef = useRef(deviceId());

  useEffect(() => {
    let socket: WebSocket | null = null;
    let stopped = false;
    const mine = idRef.current;

    const connect = () => {
      if (stopped) return;
      socket = new WebSocket(SOCKET);
      socket.onopen = () => setScanning(false);
      socket.onerror = () => setScanning(true);
      socket.onclose = () => {
        setScanning(true);
        window.setTimeout(connect, 2000);
      };
      socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data) as { event?: string; message?: string };
          if (packet.event !== 'message' || !packet.message) return;
          const data = JSON.parse(packet.message) as HereMsg | PayMsg;
          if (data.t === 'here' && data.id !== mine) {
            setPeers((current) => {
              const next = current.filter((peer) => peer.id !== data.id);
              next.push({ id: data.id, name: data.name || 'Phone', seen: Date.now() });
              return next;
            });
          }
          if (data.t === 'pay' && data.to === mine) {
            onPaymentRef.current({ amount: data.a / 100, from: data.from || 'Other phone', id: data.id });
          }
        } catch {
          // Ignore a message that is not a ManePay packet.
        }
      };
    };

    connect();
    const beat = window.setInterval(() => {
      publish({ t: 'here', id: mine, name: name || 'Phone' }).catch(() => {});
    }, 3000);
    publish({ t: 'here', id: mine, name: name || 'Phone' }).catch(() => {});
    const prune = window.setInterval(() => {
      const cutoff = Date.now() - 10000;
      setPeers((current) => current.filter((peer) => peer.seen >= cutoff));
    }, 2000);

    return () => {
      stopped = true;
      window.clearInterval(beat);
      window.clearInterval(prune);
      socket?.close();
    };
  }, [name]);

  return { peers, scanning, selfId: idRef.current };
}
