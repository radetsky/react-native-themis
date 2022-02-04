/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { Buffer } from 'buffer';

import { NativeModules } from 'react-native'

import {
  keyPair64,
  symmetricKey64,
  secureSealWithSymmetricKeyEncrypt64,
  secureSealWithSymmetricKeyDecrypt64,
  KEYTYPE_EC,
  KEYTYPE_RSA
} from 'react-native-themis'

const themis = NativeModules.Themis
const {
  COMPARATOR_NOT_READY,
  COMPARATOR_NOT_MATCH,
  COMPARATOR_MATCH,
  COMPARATOR_ERROR } = themis.getConstants()

const Section = ({ children, title }): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [privateKey, setPrivateKey] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [masterKey, setMasterKey] = useState('')
  const [encryptedWithKey, setEncryptedWithKey] = useState('')
  const [encryptedWithPassphrase, setEncryptedWithPassphrase] = useState('')
  const [encryptedWithTokenProtect, setEncryptedWithTokenProtect] = useState('')
  const [tokenProtect, setTokenProtect] = useState('')
  const [encryptedWithContextImprint, setEncryptedWithContextImprint] = useState('')
  const [signedSecureMessage, setSignedSecureMessage] = useState('')
  const [encryptedSecureMessage, setEncryptedSecureMessage] = useState('')

  const plaintext = "Hello, Themis!"
  const context = "Themis context"
  const passphrase = "Passphrase for Themis!"

  useEffect(() => {

    // Just converting incoming base64 string to UTF-8 encoded string 
    const cat = "0JrQvtGI0LrQsCDRjdGC0LAg0LHRi9C70LAg0LDQsdGB0L7Qu9GO0YLQvdC+INGH0LXRgNC90LDRjywg0LPQu9Cw0LTQutCw0Y8sINC60LDQuiDQv9Cw0L3RgtC10YDQsCwg0LrRgNCw0YHQuNCy0LDRjyDQuCwg0L/Qvi3QstC40LTQuNC80L7QvNGDLCDRhdC+0YDQvtGI0LjRhSDQutGA0L7QstC10LkuINCd0L4g0LXQuSDQvdC1INC/0L7QstC10LfQu9C+INCyINC20LjQt9C90LggKNGB0LrQvtGA0LXQtSDQstGB0LXQs9C+LCDQutGC0L4t0YLQviDQstGL0LPQvdCw0Lsg0LjQtyDQtNC+0LzRgykg0Lgg0L7QvdCwINGB0LDQvNCwINC/0YDQvtC80YvRiNC70Y/Qu9CwINC/0YDQvtC/0LjRgtCw0L3QuNC1Lg0K0JvQtdGC0L7QvCDQvdCwINCx0LvQuNC20LDQudGI0LjRhSDQtNCw0YfQvdGL0YUg0YPRh9Cw0YHRgtC60LDRhSwg0LAg0LfQuNC80L7QuSDQvdCwINC+0LrRgNC10YHRgtC90YvRhSDQv9C+0LzQvtC50LrQsNGFINCyINC/0L7RgdC10LvQutC1LiDQm9GO0LTQtdC5INC90LUg0LHQvtGP0LvQsNGB0YwsINC90L4g0Lgg0L3QtSDQt9Cw0LjRgdC60LjQstCw0LvQsCwg0Lgg0LIg0YDRg9C60Lgg0L3QtSDQtNCw0LLQsNC70LDRgdGMLiDQl9CwINC/0L7QvNC+0LnQutC4INGB0LLQuNGA0LXQv9C+INC00YDQsNC70LDRgdGMINCyINC+0LrRgNC10YHRgtC90YvQvNC4INC60L7RgtCw0LzQuCwg0LrQvtGC0L7RgNGL0LUg0LXQtSDRgdC40LvRjNC90L4g0YPQstCw0LbQsNC70LguINCt0LTQsNC60LDRjyDRhdCy0L7RgdGC0LDRgtCw0Y8gwqvQu9C10LTQuC3QvNCw0YTQuNGPwrsg0LIg0YfQtdGA0L3QvtC8LCDRgSDRgNC10LLQvtC70YzQstC10YDQvtC8INC30LAg0L/QvtGP0YHQvtC8LCDQutC+0YLQvtGA0LDRjyDQtNGA0LDQuiDQvdC1INC30LDRgtC10LLQsNC10YIsINC90L4g0LIg0YHQu9GD0YfQsNC1INGH0LXQs9C+INC/0YDQuNGB0YLRgNC10LvQuNGCLCDQvdC1INC80L7RgNCz0L3Rg9CyINCz0LvQsNC30L7QvC4=";
    const buf = Buffer.from(cat, 'base64').toString("utf-8");
    console.log("==> Cat <==:", buf);
    // End of converting example 

    // Async Themis keyPair64 example. It resolves with asymmetric keypair anyway. 
    // Always return base64 encoded strings 
    keyPair64(KEYTYPE_EC)
      .then((pair: any) => {
        console.log("pair private", pair.private64)
        console.log("pair public", pair.public64)
        setPrivateKey(pair.private64)
        setPublicKey(pair.public64)
      })

    symmetricKey64()
      .then((key64) => {
        console.log("!!! symmetric key: ", key64)
        secureSealWithSymmetricKeyEncrypt64(key64, plaintext, context)
          .then((encrypted64) => {
            console.log("encrypted64:", encrypted64)
            secureSealWithSymmetricKeyDecrypt64(key64, encrypted64, context)
              .then((decrypted) => {
                console.log("Decrypted with promise:", decrypted)
              })
              .catch((error: any) => {
                console.log(error)
              })
          })
          .catch((error) => {
            console.log("encrypted64 error:", error)
          })
      });

    (async () => {
      const key64 = await symmetricKey64()
      const encrypted64 = await secureSealWithSymmetricKeyEncrypt64(key64, plaintext, context)
      const decrypted = await secureSealWithSymmetricKeyDecrypt64(key64, encrypted64, context)

      console.log("[!!!] Asynced decrypted:", decrypted)
    })();

    themis.symmetricKey((symmetricKey) => {
      console.log(symmetricKey)
      setMasterKey(symmetricKey)
      console.log("Symmetric key: ", Buffer.from(new Uint8Array(symmetricKey)).toString("base64"))
      console.log(`Encrypting "${plaintext}" with context "${context}" and random generated symmetric key`)
      themis.secureSealWithSymmetricKeyEncrypt(symmetricKey, plaintext, context, (encrypted) => {
        setEncryptedWithKey(encrypted)
        console.log("Encrypted with symmetric key:", Buffer.from(new Uint8Array(encrypted)).toString("base64"))
        themis.secureSealWithSymmetricKeyDecrypt(symmetricKey, encrypted, context, (decrypted) => {
          console.log("Decrypted with symmetric key:", Buffer.from(new Uint8Array(decrypted)).toString())
        }, (error) => {
          console.error(error) // decrypt error
        })
      }, (error) => {
        console.error(error) // encrypt error
      })
    })

    themis.secureSealWithPassphraseEncrypt(passphrase, plaintext, context, (encrypted) => {
      setEncryptedWithPassphrase(encrypted)
      console.log("Encrypted with passphrase:", Buffer.from(new Uint8Array(encrypted)).toString("base64"))
      themis.secureSealWithPassphraseDecrypt(passphrase, encrypted, context, (decrypted) => {
        console.log("Decrypted with passphrase:", Buffer.from(new Uint8Array(decrypted)).toString())
      }, (error) => {
        console.error(error)
      })
    })

    themis.symmetricKey((symmetricKey) => {
      themis.tokenProtectEncrypt(symmetricKey, plaintext, context, (result) => {
        console.log("Encrypted with token protect: ", result)
        setEncryptedWithTokenProtect(result.encrypted)
        setTokenProtect(result.token)
        themis.tokenProtectDecrypt(symmetricKey, result.encrypted, result.token, context, (decrypted) => {
          console.log("Decrypted with token protect:", Buffer.from(new Uint8Array(decrypted)).toString())
        }, (error) => {
          console.error(error) // decrypt error 
        })
      }, (error) => {
        console.error(error) // encrypt error 
      })
    })

    themis.symmetricKey((symmetricKey) => {
      themis.contextImprintEncrypt(symmetricKey, plaintext, " ", (encrypted) => {
        setEncryptedWithContextImprint(encrypted)
        console.log("Encrypted with context imprint:", Buffer.from(new Uint8Array(encrypted)).toString("base64"))
        themis.contextImprintDecrypt(symmetricKey, encrypted, " ", (decrypted) => {
          console.log("Decrypted with context imprint:", Buffer.from(new Uint8Array(decrypted)).toString())
        }, (error) => {
          console.error(error) // decrypt error 
        })
      }, (error) => {
        console.error(error) // encrypt error
      })
    })

    themis.keyPair(KEYTYPE_EC, (keyPair) => {
      themis.secureMessageSign(plaintext, keyPair.private, null, (signed) => {
        console.log("Signed secure message:", Buffer.from(new Uint8Array(signed)).toString("base64"))
        setSignedSecureMessage(signed)
        themis.secureMessageVerify(signed, null, keyPair.public, (verified) => {
          console.log("Verified secure message:", Buffer.from(new Uint8Array(verified)).toString())
        }, (error) => {
          console.error(error)
        })
      }, (error) => {
        console.error(error)
      })
    })

    themis.keyPair(KEYTYPE_RSA, (aliceKeyPair) => {
      themis.keyPair(KEYTYPE_RSA, (bobKeyPair) => {
        themis.secureMessageEncrypt(plaintext, aliceKeyPair.private, bobKeyPair.public, (encrypted) => {
          console.log("Encrypted secure message:", Buffer.from(new Uint8Array(encrypted)).toString("base64"))
          setEncryptedSecureMessage(encrypted)
          themis.secureMessageDecrypt(encrypted, bobKeyPair.private, aliceKeyPair.public, (decrypted) => {
            console.log("Decrypted secure message:", Buffer.from(new Uint8Array(decrypted)).toString())
          }, (error) => { console.error(error) })
        }, (error) => { console.error(error) })
      })
    })

    const proceedCompare = (data, server, client) => {
      // receive data from server 
      themis.proceedCompare(server, data, (nextData, serverStatus) => {
        console.log("=== Server proceeded with status:", serverStatus)
        themis.proceedCompare(client, nextData, (nextNextData, clientStatus) => {
          console.log("=== Client proceeded with status:", clientStatus)
          if (clientStatus == COMPARATOR_NOT_READY ||
            serverStatus == COMPARATOR_NOT_READY) {
            proceedCompare(nextNextData, server, client) // Continue process of compare
          } else {
            if (clientStatus == COMPARATOR_MATCH) {
              console.log("=== SecureComparator secrets match")
            } else {
              console.log("=== SecureComparator secrets NOT match")
            }
          }
        }, (error) => {
          console.error(error)
        })
      }, (error) => {
        console.error(error)
      })
    }

    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam aliquam dictum tellus, eget malesuada lectus scelerisque non. Curabitur at nibh vestibulum, sagittis felis non, convallis magna. Vestibulum fringilla a urna quis facilisis. Etiam rhoncus hendrerit diam, at elementum nisi condimentum dignissim. Nam eleifend libero accumsan pharetra cursus. Phasellus eget nulla pellentesque, elementum dui eu, malesuada mi. Quisque dolor augue, mattis ut mauris id, sollicitudin fermentum elit. Suspendisse nulla velit, tincidunt a viverra interdum, cursus vitae nunc. Proin turpis ante, consectetur nec nisl consequat, rhoncus congue risus. Sed mattis tempus mi quis hendrerit. Nullam sit amet arcu dapibus, dignissim risus nec, tempus metus. Morbi condimentum sagittis metus eu eleifend. Duis scelerisque eu tellus non porta. Duis viverra tincidunt congue."
    themis.stringSerialize(lorem, (symmetricKey) => {
      themis.stringSerialize(plaintext, (plainKey) => {
        // console.log("=== Symkey for comparator:", Buffer.from(new Uint8Array(symmetricKey)).toString('base64'))
        themis.initComparator(symmetricKey, (server) => {
          console.log("=== Server:", server)
          themis.statusOfComparator(server, (status) => {
            console.log("=== Example status:", status)
          })
          themis.initComparator(plainKey, (client) => {
            console.log("=== Client:", client)
            themis.beginCompare(client, (data) => {
              proceedCompare(data, server, client)
            }, (error) => {
              console.error(error)
            })
          }, (clientError) => {
            console.error(clientError) // client comparator error 
          })
        }, (serverError) => {
          console.error(serverError) // server comparator error 
        })
      })
    })

    // Test from Java
    const buffj = Buffer.from('AAEBQQwAAAAQAAAAEwAAABYAAAADLKbW7aho9FeDMqy0iRukfGpZAGnEcYqpfAX2QA0DABAAk2Vk0xoTQzLLUoujO2L39JcNyl6AMSHF3o/V9itzchX/7PA=', 'base64');
    const testj = buffj.toJSON().data;
    themis.secureSealWithPassphraseDecrypt('a password', testj, 'Java context', (decrypted) => {
      console.log("Decrypted with passphrase from Java:", Buffer.from(new Uint8Array(decrypted)).toString())
    }, (error) => {
      console.log(error)
    })

    // Test with symmetric keys from Java
    const javaSymKey = Buffer.from('Z7BY52XyuM0ss1Ma/O+4Fy9mal5lvMDRyK2nZpuA4U0=', 'base64');
    const javaSymKeyData = javaSymKey.toJSON().data;
    const javaEnc = Buffer.from('AAEBQAwAAAAQAAAAEwAAAFQFGDh5JAJFNzoXDi3SGSWqNfccYlWc/RiBf3QL8YtaT3gRlj8whlx2umdrsFE1', 'base64');
    const javaEncData = javaEnc.toJSON().data;
    themis.secureSealWithSymmetricKeyDecrypt(javaSymKeyData, javaEncData, 'Java context', (decrypted) => {
      console.log("Decrypted with symmetric key from Java:", Buffer.from(new Uint8Array(decrypted)).toString())
    }, (error) => {
      console.log("Decrypt with symmetric key from Java:", error);
    })

    // Test from Python
    const buffp = Buffer.from('AAEBQQwAAAAQAAAAEAAAABYAAACqaCdlWERyzPeFEWJbPP+fqksXKvYAUVWSb4caQA0DABAApYwgn2Kt+WKXtP3X3lL0lJ5gA4+b+vo7VWiJjmtf4d8=', 'base64');
    const testp = buffp.toJSON().data;
    themis.secureSealWithPassphraseDecrypt('a password', testp, 'Python context', (decrypted) => {
      console.log("Decrypted with passphrase from Python:", Buffer.from(new Uint8Array(decrypted)).toString())
    }, (error) => {
      console.log(error)
    })

    // Test with symmetric keys from Python
    const pySymKey = Buffer.from('pGFN54NKRpF53bpf5YtO5PmDVT9N/Ep9Hm0N0w8UXnU=', 'base64');
    const pySymKeyData = pySymKey.toJSON().data;
    const pyEnc = Buffer.from('AAEBQAwAAAAQAAAAEAAAAEIBP7ow0hZg7j1mv0P+S9mYC+H0AJ172CiBOTj1Sqlxzz9wboZCtTnnNwi9', 'base64');
    const pyEncData = pyEnc.toJSON().data;
    themis.secureSealWithSymmetricKeyDecrypt(pySymKeyData, pyEncData, 'Python context', (decrypted) => {
      console.log("Decrypted with symmetric key from Python:", Buffer.from(new Uint8Array(decrypted)).toString())
    }, (error) => {
      console.log("Decrypt with symmetric key from Python:", error);
    })

    // Test from Obj-C
    const buff = Buffer.from('AAEBQQwAAAAQAAAAFAAAABYAAAASUGtcrR36rVjhVPkbJRNFOXfP5DrmL0g41K3kQA0DABAAwDRJ9q4LtOtf2D2jRkZcIgy8rQU61NHu69wFdvKAfNPL1OdU', 'base64');
    const test = buff.toJSON().data;
    themis.secureSealWithPassphraseDecrypt('test', test, 'test', (decrypted) => {
      console.log("Decrypted with passphrase from ObjC:", Buffer.from(new Uint8Array(decrypted)).toString())
    }, (error) => {
      console.log(error)
    })

    // Test with symmetric keys from Obj-C 
    const objcSymKey = Buffer.from('B+L00zvIOBh/qSTI0hAE2S2unSHhS+0EHspVCToi3oA=', 'base64');
    const objcSymKeyData = objcSymKey.toJSON().data;
    const objcEnc = Buffer.from('AAEBQAwAAAAQAAAAEAAAACd7hM2MWqiWu5SDNtzvgjcvN3PBY+VBg9kJQB8R1cwcXfOy8sY75+3pRCe0', 'base64');
    const objcEncData = objcEnc.toJSON().data;
    console.log(objcEncData);
    themis.secureSealWithSymmetricKeyDecrypt(objcSymKeyData, objcEncData, 'test', (decrypted) => {
      console.log("Decrypted with symmetric key from ObjC:", Buffer.from(new Uint8Array(decrypted)).toString())
    }, (error) => {
      console.log("Decrypt with symmetric key from ObjC:", error);
    })


  }, [])

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Asymmetric Keys">
            <View>
              <Text>Private key:</Text>
              <Text numberOfLines={3} style={styles.blob}>{privateKey}</Text>
            </View>
            <View style={{ paddingTop: 10 }}>
              <Text>Public key:</Text>
              <Text numberOfLines={3} style={styles.blob}>{publicKey}</Text>
            </View>
          </Section>
          <Section title="Symmetric Key">
            <View>
              <Text>Symmetric key:</Text>
              <Text numberOfLines={3} style={styles.blob}>
                {Buffer.from(new Uint8Array(masterKey)).toString("base64")}
              </Text>
            </View>
          </Section>
          <Section title="Encrypted with the key">
            <Text numberOfLines={3} style={styles.blob}>
              {Buffer.from(new Uint8Array(encryptedWithKey)).toString("base64")}
            </Text>
          </Section>
          <Section title="Encrypted with the passphrase">
            <Text numberOfLines={3} style={styles.blob}>
              {Buffer.from(new Uint8Array(encryptedWithPassphrase)).toString("base64")}
            </Text>
          </Section>
          <Section title="Encrypted with token protect">
            <View>
              <Text>Encrypted with the same length:</Text>
              <Text numberOfLines={3} style={styles.blob}>
                {Buffer.from(new Uint8Array(encryptedWithTokenProtect)).toString("base64")}
              </Text>
            </View>
            <View style={{ paddingTop: 10 }}>
              <Text>Token</Text>
              <Text numberOfLines={3} style={styles.blob}>
                {Buffer.from(new Uint8Array(tokenProtect)).toString("base64")}
              </Text>
            </View>
          </Section>
          <Section title="Encrypted with context imprint">
            <Text numberOfLines={3} style={styles.blob}>
              {Buffer.from(new Uint8Array(encryptedWithContextImprint)).toString("base64")}
            </Text>
          </Section>
          <Section title="Signed secure message">
            <Text numberOfLines={3} style={styles.blob}>
              {Buffer.from(new Uint8Array(signedSecureMessage)).toString("base64")}
            </Text>
          </Section>
          <Section title="Encrypted secure message">
            <Text numberOfLines={3} style={styles.blob}>
              {Buffer.from(new Uint8Array(encryptedSecureMessage)).toString("base64")}
            </Text>
          </Section>
        </View>
      </ScrollView >
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  blob: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flexWrap: 'nowrap',
    flexShrink: 1,
  }
});

export default App;
