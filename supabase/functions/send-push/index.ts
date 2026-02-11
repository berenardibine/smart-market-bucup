import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as encodeBase64Url } from "https://deno.land/std@0.168.0/encoding/base64url.ts";
import { decode as decodeBase64Url } from "https://deno.land/std@0.168.0/encoding/base64url.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VAPID_PUBLIC_KEY = 'BJQLmyHGaCpq_n_BhNqefS1x1MoK4DqjkAC793XzKEhaA3OmVOOx1OyjjB-HI7XqsCqarTmncXH4B_v4mGKJecw';
const VAPID_SUBJECT = 'mailto:admin@smart-market.com';

// ── VAPID JWT Generation ──
async function createVapidJwt(audience: string, privateKeyBase64: string, publicKeyBase64: string): Promise<{ authorization: string; cryptoKey: string }> {
  // Import private key as JWK
  const privateKeyBytes = decodeBase64Url(privateKeyBase64);
  const publicKeyBytes = decodeBase64Url(publicKeyBase64);
  
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: encodeBase64Url(publicKeyBytes.slice(1, 33)),
    y: encodeBase64Url(publicKeyBytes.slice(33, 65)),
    d: encodeBase64Url(privateKeyBytes),
  };

  const key = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  );

  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 86400,
    sub: VAPID_SUBJECT,
  };

  const headerB64 = encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format if needed
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    // DER format: parse r and s
    rawSig = derToRaw(sigBytes);
  }

  const signatureB64 = encodeBase64Url(rawSig);
  const jwt = `${unsignedToken}.${signatureB64}`;

  const vapidPublicKeyUrlSafe = publicKeyBase64;
  const authorization = `vapid t=${jwt}, k=${vapidPublicKeyUrlSafe}`;

  return { authorization, cryptoKey: vapidPublicKeyUrlSafe };
}

function derToRaw(der: Uint8Array): Uint8Array {
  // Simple DER to raw r||s conversion for ECDSA P-256
  const raw = new Uint8Array(64);
  let offset = 2; // skip 0x30, length
  
  // R
  if (der[offset] !== 0x02) throw new Error('Invalid DER');
  offset++;
  let rLen = der[offset]; offset++;
  let rStart = offset;
  if (rLen === 33 && der[rStart] === 0) { rStart++; rLen = 32; }
  const rPad = 32 - rLen;
  raw.set(der.slice(rStart, rStart + rLen), rPad > 0 ? rPad : 0);
  offset = rStart + rLen;
  
  // S
  if (der[offset] !== 0x02) throw new Error('Invalid DER');
  offset++;
  let sLen = der[offset]; offset++;
  let sStart = offset;
  if (sLen === 33 && der[sStart] === 0) { sStart++; sLen = 32; }
  const sPad = 32 - sLen;
  raw.set(der.slice(sStart, sStart + sLen), 32 + (sPad > 0 ? sPad : 0));
  
  return raw;
}

// ── Encrypt Push Payload (RFC 8291 aes128gcm) ──
async function encryptPayload(
  p256dhBase64: string,
  authBase64: string,
  payload: Uint8Array
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const subscriberPublicKeyBytes = decodeBase64Url(p256dhBase64);
  const authSecretBytes = decodeBase64Url(authBase64);

  // Import subscriber public key
  const subscriberKey = await crypto.subtle.importKey(
    'raw', subscriberPublicKeyBytes, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  );

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberKey },
    localKeyPair.privateKey, 256
  );

  // Export local public key
  const localPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', localKeyPair.publicKey));

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive IKM using auth secret
  const authInfo = new TextEncoder().encode('WebPush: info\0');
  const ikm_info = new Uint8Array(authInfo.length + subscriberPublicKeyBytes.length + localPublicKeyRaw.length);
  ikm_info.set(authInfo);
  ikm_info.set(new Uint8Array(subscriberPublicKeyBytes), authInfo.length);
  ikm_info.set(localPublicKeyRaw, authInfo.length + subscriberPublicKeyBytes.length);

  const authKey = await crypto.subtle.importKey('raw', authSecretBytes, { name: 'HKDF' }, false, ['deriveBits']);
  const prk = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(sharedSecret), info: ikm_info },
    authKey, 256
  );

  // Derive CEK and nonce
  const prkKey = await crypto.subtle.importKey('raw', new Uint8Array(prk), { name: 'HKDF' }, false, ['deriveBits']);
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');

  const cekBits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo }, prkKey, 128);
  const nonceBits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, prkKey, 96);

  // Pad payload and encrypt
  const paddedPayload = new Uint8Array(payload.length + 2);
  paddedPayload.set(payload);
  paddedPayload[payload.length] = 2; // delimiter
  paddedPayload[payload.length + 1] = 0; // padding

  const aesKey = await crypto.subtle.importKey('raw', new Uint8Array(cekBits), 'AES-GCM', false, ['encrypt']);
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: new Uint8Array(nonceBits) },
    aesKey, paddedPayload
  );

  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
  const rs = 4096;
  const header = new Uint8Array(16 + 4 + 1 + localPublicKeyRaw.length);
  header.set(salt);
  new DataView(header.buffer).setUint32(16, rs);
  header[20] = localPublicKeyRaw.length;
  header.set(localPublicKeyRaw, 21);

  const result = new Uint8Array(header.length + encryptedData.byteLength);
  result.set(header);
  result.set(new Uint8Array(encryptedData), header.length);

  return { encrypted: result, salt, localPublicKey: localPublicKeyRaw };
}

async function sendWebPush(sub: { endpoint: string; p256dh: string; auth: string }, payloadStr: string) {
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';
  if (!vapidPrivateKey) throw new Error('VAPID_PRIVATE_KEY not set');

  const endpointUrl = new URL(sub.endpoint);
  const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

  const { authorization } = await createVapidJwt(audience, vapidPrivateKey, VAPID_PUBLIC_KEY);
  
  const payload = new TextEncoder().encode(payloadStr);
  const { encrypted } = await encryptPayload(sub.p256dh, sub.auth, payload);

  const response = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authorization,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
    },
    body: encrypted,
  });

  const responseText = await response.text();

  if (!response.ok && response.status !== 201) {
    throw new Error(`Push ${response.status}: ${responseText}`);
  }

  return response.status;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://tbykrulfzhhkmtgjhvjh.supabase.co';
    const supabase: any = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    const { title, body, url, userId, broadcast, type } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let sent = 0;
    let failed = 0;

    // ── 1. Send via Web Push (VAPID-signed) to push_subscriptions ──
    let pushQuery = supabase.from('push_subscriptions').select('*');
    if (!broadcast && userId) {
      pushQuery = pushQuery.eq('user_id', userId);
    }
    const { data: subscriptions } = await pushQuery;

    if (subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title,
        body,
        url: url || '/',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: type || 'smart-market-notification',
      });

      for (const sub of subscriptions) {
        try {
          await sendWebPush({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }, payload);
          sent++;
        } catch (err: any) {
          console.error('[WebPush] Send failed:', err?.message || err);
          if (String(err).includes('410') || String(err).includes('404')) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
          failed++;
        }
      }
    }

    const totalTargets = subscriptions?.length || 0;

    // ── 3. Log to notifications_history & notifications ──
    const historyEntries: any[] = [];
    if (broadcast) {
      const userIds = new Set<string>();
      (subscriptions || []).forEach((s: any) => { if (s.user_id) userIds.add(s.user_id); });

      userIds.forEach(uid => {
        historyEntries.push({ user_id: uid, title, body, type: type || 'broadcast', url: url || '/', delivered: sent > 0 });
      });

      const notifInserts = Array.from(userIds).map(uid => ({ title, message: body, type: 'push', user_id: uid }));
      if (notifInserts.length > 0) {
        await supabase.from('notifications').insert(notifInserts);
      }
    } else if (userId) {
      historyEntries.push({ user_id: userId, title, body, type: type || 'direct', url: url || '/', delivered: sent > 0 });
      await supabase.from('notifications').insert({ title, message: body, type: 'push', user_id: userId });
    }

    if (historyEntries.length > 0) {
      await supabase.from('notifications_history').insert(historyEntries);
    }

    console.log(`[send-push] Sent: ${sent}, Failed: ${failed}, Total targets: ${totalTargets}`);

    return new Response(JSON.stringify({ sent, failed, total: totalTargets }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('Push notification error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
