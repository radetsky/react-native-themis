import { NativeModules, Platform } from 'react-native';
import { Buffer } from 'buffer';


const LINKING_ERROR =
  `The package 'react-native-themis' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const Themis = NativeModules.Themis
  ? NativeModules.Themis
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export const {
  COMPARATOR_NOT_READY,
  COMPARATOR_NOT_MATCH,
  COMPARATOR_MATCH,
  COMPARATOR_ERROR,
  KEYTYPE_RSA,
  KEYTYPE_EC } = Themis.getConstants()


export function keyPair64(typeOfKey: any): Promise<Object> {
  return new Promise((resolve) => {
    Themis.keyPair(typeOfKey, (pair: any) => {
      const pvtKey64 = Buffer.from(new Uint8Array(pair.private)).toString("base64");
      const pubKey64 = Buffer.from(new Uint8Array(pair.public)).toString("base64");
      resolve({
        private64: pvtKey64,
        public64: pubKey64,
      });
    })
  })
};

export function symmetricKey64(): Promise<String> {
  return new Promise((resolve) => {
    Themis.symmetricKey((key: any) => {
      resolve(Buffer.from(new Uint8Array(key)).toString("base64"));
    })
  })
};

export function secureSealWithSymmetricKeyEncrypt64(
  symmetricKey64: String,
  plaintext: String,
  context: String): Promise<String> {

  return new Promise((resolve, reject) => {
    const symmetricKey = Array.from(Buffer.from(symmetricKey64, 'base64'));
    Themis.secureSealWithSymmetricKeyEncrypt(symmetricKey, plaintext, context, (encrypted: any) => {
      console.log('!!! promised encrypted 64:', encrypted)
      resolve(Buffer.from(new Uint8Array(encrypted)).toString("base64"))
    }, (error: any) => {
      console.log(error)
      reject(error)
    })
  })
};

export function secureSealWithSymmetricKeyDecrypt64(
  symmetricKey64: String,
  encrypted64: String,
  context: String): Promise<String> {

  const symmetricKey = Array.from(Buffer.from(symmetricKey64, 'base64'));
  const encrypted = Array.from(Buffer.from(encrypted64, 'base64'));

  return new Promise((resolve, reject) => {
    Themis.secureSealWithSymmetricKeyDecrypt(symmetricKey, encrypted, context, (decrypted: any) => {
      resolve(Buffer.from(new Uint8Array(decrypted)).toString())
    }, (error: any) => {
      reject(error)
    })
  })
};


