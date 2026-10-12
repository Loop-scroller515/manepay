import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, SafeAreaView, Platform, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Default to the production hosted ManePay app (accessible anywhere on cellular or Wi-Fi)
const PRODUCTION_URL = 'https://aadi16101.github.io/manepay/';

export default function App() {
  const [appUrl, setAppUrl] = useState(PRODUCTION_URL);
  const [hasError, setHasError] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor="#10141a" />
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>ManePay Connection</Text>
          <Text style={styles.errorText}>Could not connect to {appUrl}.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
            }}
          >
            <Text style={styles.retryText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          source={{ uri: appUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          startInLoadingState={true}
          onError={() => setHasError(true)}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00e599" />
              <Text style={styles.loadingText}>Launching ManePay...</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10141a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
    backgroundColor: '#10141a',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#10141a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#dfe2eb',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#10141a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#dfe2eb',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: '#849589',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00e599',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryText: {
    color: '#00613e',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
