import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as Network from 'expo-network';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const SITE_URL = 'https://manepay.vercel.app/';
const STORAGE_KEY = 'manepay_offline_ledger_v1';

export default function App() {
  const [mode, setMode] = useState('terminal');
  const [online, setOnline] = useState(false);
  const [amountText, setAmountText] = useState('');
  const [rows, setRows] = useState([]);
  const [note, setNote] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancel || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRows(parsed);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancel) setReady(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows)).catch(() => {});
  }, [rows, ready]);

  useEffect(() => {
    let stop = false;
    const read = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (!stop) setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
      } catch {
        if (!stop) setOnline(false);
      }
    };
    read();
    const id = setInterval(read, 4000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  const amount = Number(amountText);
  const canStore = Number.isFinite(amount) && amount > 0;
  const pending = rows.filter((row) => row.status === 'pending');

  const storePayment = () => {
    if (!canStore) return;
    const next = {
      id: `${Date.now()}`,
      amount: Math.round(amount * 100) / 100,
      status: 'pending',
      at: new Date().toISOString(),
    };
    setRows((current) => [next, ...current]);
    setAmountText('');
    setNote('Stored on this phone. No bank was contacted.');
  };

  const settle = () => {
    if (!online || pending.length === 0) return;
    setRows((current) => current.map((row) => (row.status === 'pending' ? { ...row, status: 'settled' } : row)));
    setNote('Credited to demo account DEMO-1042. This is not a bank.');
  };

  if (mode === 'site') {
    return (
      <SafeAreaView style={styles.screen}>
        <ExpoStatusBar style="light" />
        <View style={styles.siteBar}>
          <Pressable onPress={() => setMode('terminal')} style={styles.secondaryButton}>
            <Text style={styles.secondaryLabel}>Offline terminal</Text>
          </Pressable>
          <Text style={styles.siteHint}>{online ? 'Site needs a network' : 'Network off'}</Text>
        </View>
        {online ? (
          <WebView source={{ uri: SITE_URL }} style={styles.web} />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.title}>The website cannot load</Text>
            <Text style={styles.body}>Use the offline terminal. It keeps the ledger on this phone.</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ExpoStatusBar style="light" />
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.kicker}>ManePay</Text>
            <Text style={styles.title}>Offline terminal</Text>
            <Text style={styles.body}>
              Demo settlement account DEMO-1042, held by Demo Merchant. It exists only in this app.
            </Text>
            <Text style={styles.status}>
              Demo balance ₹{(25000 + rows.filter((row) => row.status === 'settled').reduce((sum, row) => sum + row.amount, 0)).toFixed(2)}
            </Text>
            <Text style={styles.status}>{online ? 'Network on' : 'Network off'}</Text>
            <Text style={styles.label}>Amount in INR</Text>
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#849589"
              style={styles.input}
            />
            <Pressable onPress={storePayment} disabled={!canStore} style={[styles.primaryButton, !canStore && styles.disabled]}>
              <Text style={styles.primaryLabel}>Store payment</Text>
            </Pressable>
            <Pressable
              onPress={settle}
              disabled={!online || pending.length === 0}
              style={[styles.secondaryButton, styles.blockButton, (!online || pending.length === 0) && styles.disabled]}
            >
              <Text style={styles.secondaryLabel}>Settle stored payments</Text>
            </Pressable>
            <Pressable onPress={() => setMode('site')} style={[styles.secondaryButton, styles.blockButton]}>
              <Text style={styles.secondaryLabel}>Open website</Text>
            </Pressable>
            {note ? <Text style={styles.note}>{note}</Text> : null}
            <Text style={styles.section}>Ledger on this phone</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.body}>No payments stored yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowAmount}>₹{item.amount.toFixed(2)}</Text>
            <Text style={styles.rowMeta}>
              {item.status === 'pending' ? 'Pending' : 'Settled on device'} · {new Date(item.at).toLocaleString('en-IN')}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#10141a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  kicker: {
    color: '#00e599',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  title: {
    color: '#dfe2eb',
    fontSize: 28,
    fontWeight: '600',
    marginTop: 6,
  },
  body: {
    color: '#bacbbe',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  status: {
    color: '#dfe2eb',
    marginTop: 16,
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    color: '#849589',
    marginTop: 16,
    fontSize: 13,
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#3b4a41',
    color: '#dfe2eb',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 20,
    borderRadius: 4,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#00e599',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  primaryLabel: {
    color: '#003822',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#3b4a41',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  blockButton: {
    marginTop: 8,
  },
  secondaryLabel: {
    color: '#dfe2eb',
    fontWeight: '600',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.4,
  },
  note: {
    color: '#00e599',
    marginTop: 12,
    fontSize: 14,
  },
  section: {
    color: '#dfe2eb',
    marginTop: 24,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    borderTopWidth: 1,
    borderTopColor: '#262a31',
    paddingVertical: 12,
  },
  rowAmount: {
    color: '#dfe2eb',
    fontSize: 18,
    fontWeight: '600',
  },
  rowMeta: {
    color: '#849589',
    marginTop: 2,
    fontSize: 13,
  },
  siteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    gap: 12,
  },
  siteHint: {
    color: '#849589',
    fontSize: 12,
    flexShrink: 1,
  },
  web: {
    flex: 1,
    backgroundColor: '#10141a',
  },
  empty: {
    flex: 1,
    padding: 20,
  },
});
