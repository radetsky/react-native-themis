//
//  RCTThemis.m
//  ThemisExample
//
//  Created by Oleksii Radetskyi on 04.11.2021.
//

#import <Foundation/Foundation.h>
#import <React/RCTLog.h>
#import "Themis.h"

@import themis;

@implementation Themis

// To export a module named RCTThemis
RCT_EXPORT_MODULE(Themis);

// To save the comparators objects
NSMutableDictionary* cmprs;

- (instancetype)init
{
  self = [super init];
  cmprs = [[NSMutableDictionary alloc] init];
  return self;
}

/* MARK: Export constants of the module */
- (NSDictionary *)constantsToExport
{
  return @{ @"COMPARATOR_NOT_READY": [[NSNumber alloc] initWithLong: TSComparatorNotReady],
            @"COMPARATOR_NOT_MATCH": [[NSNumber alloc] initWithLong: TSComparatorNotMatch],
            @"COMPARATOR_MATCH":     [[NSNumber alloc] initWithLong: TSComparatorMatch],
            @"COMPARATOR_ERROR":     @-1, // For compatibility with Java version
            @"KEYTYPE_RSA": @KEYTYPE_RSA,
            @"KEYTYPE_EC": @KEYTYPE_EC
 };
}


/***********************************************/
/* Used to export NSData* to React Native app  */
/* NSData --> NSArray[NSNumber(unsigned char)] */
/*                                             */

+ (NSArray*)dataSerialize:(NSData*) data
{
  if (data == nil) return nil;
  
  const char* buffer = (const char*) data.bytes;
  NSMutableArray<NSNumber*> *array = [[NSMutableArray alloc] init];
  
  for (NSInteger i = 0; i < data.length; i++) {
    NSNumber *num = [[NSNumber alloc] initWithUnsignedChar: buffer[i]];
    [array addObject:num];
  }
  return [array copy];
}

/*************************************************/
/* Used to import NSData* from React Native app  */
/* NSData <-- NSArray[NSNumber(unsigned char)]   */
/*                                               */


+ (NSData*)dataDeserialize:(NSArray*) data
{
  if (data == nil) return nil;
  
  char* buffer = (char*)malloc(data.count);
  if (buffer == nil) {
    return nil; // malloc returns nil
  }
  
  for (NSInteger i = 0; i < data.count; i++) {
    NSNumber *num = data[i];
    const unsigned char c = num.unsignedCharValue;
    if (c < 0 || c > 255) {
      NSException *e = [NSException
                        exceptionWithName:@"ByteOverflowException"
                        reason:@"Value is out of range"
                        userInfo:nil];
      @throw e;
    }
    buffer[i] = c;
  }

  NSData *result = [NSData dataWithBytesNoCopy:buffer length:data.count freeWhenDone:YES];
  
  return result;
}

RCT_EXPORT_METHOD(stringSerialize:(NSString*) text
                  callback:(RCTResponseSenderBlock)callback
                  )
{
  NSData* data = [text dataUsingEncoding:NSUTF8StringEncoding];
    NSArray *data2 = [Themis dataSerialize: data];
  callback(@[data2]);
}


RCT_EXPORT_METHOD(keyPair:(nonnull NSNumber*) algorithm
                  callback:(RCTResponseSenderBlock)callback)
{
  TSKeyGen *keypair;
  switch (algorithm.intValue) {
    case KEYTYPE_RSA:
      keypair = [[TSKeyGen alloc] initWithAlgorithm:TSKeyGenAsymmetricAlgorithmRSA];
      break;
    default:
      keypair = [[TSKeyGen alloc] initWithAlgorithm:TSKeyGenAsymmetricAlgorithmEC];
      break;
  }

    NSArray  *privateKey = [Themis dataSerialize: keypair.privateKey];
    NSArray   *publicKey = [Themis dataSerialize: keypair.publicKey];
  
  NSDictionary *dictionary = @{
       @"private" : privateKey,
       @"public"  : publicKey
  };
  callback(@[dictionary]);
}


RCT_EXPORT_METHOD(symmetricKey:(RCTResponseSenderBlock)callback)
{
  NSData *symmetricKey = TSGenerateSymmetricKey();
    NSArray *masterKey = [Themis dataSerialize: symmetricKey];
  callback(@[masterKey]);
}

- (TSCellSeal *)newSealMode: (NSArray*) symmetricKey
{
  @try {
      NSData *masterKey = [Themis dataDeserialize: symmetricKey];
    TSCellSeal *cell = [[TSCellSeal alloc] initWithKey:masterKey];
    return cell;
  }
  @catch (NSException *e) {
    @throw e; // rethrow to catch in final function
  }

}





RCT_EXPORT_METHOD(secureSealWithSymmetricKeyEncrypt:(NSArray*) symmetricKey
                  plaintext: (NSString*)plaintext
                  context: (NSString*)context
                  successCallback: (RCTResponseSenderBlock)successCallback
                  errorCallback: (RCTResponseErrorBlock)errorCallback)
{

  TSCellSeal *cell;
  @try {
    cell  = [self newSealMode:symmetricKey];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  
  NSData *txt  = [plaintext dataUsingEncoding:NSUTF8StringEncoding];
  NSData *ctx  = [context dataUsingEncoding:NSUTF8StringEncoding];
  NSData *encrypted = [cell encrypt:txt context:ctx];
    NSArray *result = [Themis dataSerialize:encrypted];
  successCallback(@[result]);
}

RCT_EXPORT_METHOD(secureSealWithSymmetricKeyDecrypt:(NSArray*) symmetricKey
                  encrypted:(NSArray*) encrypted
                  context: (NSString*) context
                  successCallback:(RCTResponseSenderBlock)successCallback
                  errorCallback:(RCTResponseErrorBlock)errorCallback
                  )

{
  TSCellSeal *cell;
  NSData *enc;
  
  @try {
    cell = [self newSealMode:symmetricKey];
      enc  = [Themis dataDeserialize:encrypted];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  
  NSData *ctx  = [context dataUsingEncoding:NSUTF8StringEncoding];
  
  NSError *error;
  NSData  *decrypted = [cell decrypt:enc
                             context:ctx
                               error:&error];
  if (error) {
    errorCallback(error);
  } else {
      NSArray* result = [Themis dataSerialize:decrypted];
    successCallback(@[result]);
  }
  
}


- (TSCellSeal *)newSealModeWithPassphrase: (NSString*) passphrase
{
  TSCellSeal *cell = [[TSCellSeal alloc] initWithPassphrase: passphrase];
  return cell;
}


RCT_EXPORT_METHOD(secureSealWithPassphraseEncrypt:(NSString*) passphrase
                  plaintext: (NSString*)plaintext
                  context: (NSString*)context
                  callback: (RCTResponseSenderBlock)callback)
{

  TSCellSeal *cell  = [self newSealModeWithPassphrase:passphrase];
  
  NSData *txt  = [plaintext dataUsingEncoding:NSUTF8StringEncoding];
  NSData *ctx  = [context dataUsingEncoding:NSUTF8StringEncoding];
  NSData *encrypted = [cell encrypt:txt context:ctx];
  
    NSArray *result = [Themis dataSerialize:encrypted];

  callback(@[result]);
}

RCT_EXPORT_METHOD(secureSealWithPassphraseDecrypt:(NSString*) passphrase
                  encrypted:(NSArray*) encrypted
                  context: (NSString*) context
                  successCallback:(RCTResponseSenderBlock)successCallback
                  errorCallback:(RCTResponseErrorBlock)errorCallback
                  )

{
  TSCellSeal *cell  = [self newSealModeWithPassphrase:passphrase];
  NSData *enc;
  
  @try {
      enc  = [Themis dataDeserialize:encrypted];
  } @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
  }
  
  NSData *ctx  = [context dataUsingEncoding:NSUTF8StringEncoding];
  
  NSError *error;
  NSData  *decrypted = [cell decrypt:enc
                             context:ctx
                               error:&error];
  if (error) {
    errorCallback(error);
  } else {
      NSArray* result = [Themis dataSerialize:decrypted];
    successCallback(@[result]);
  }
  
}

/* MARK: Token protect mode */

- (TSCellToken *)newTokenMode:(NSArray*) symmetricKey
{
  @try {
      NSData *masterKey = [Themis dataDeserialize: symmetricKey];
    TSCellToken *cell = [[TSCellToken alloc] initWithKey:masterKey];
    return cell;
  }
  @catch (NSException *e) {
    @throw e;
  }
}

RCT_EXPORT_METHOD(tokenProtectEncrypt:(NSArray*) symmetricKey
                  plaintext: (NSString*)plaintext
                  context: (NSString*)context
                  successCallback: (RCTResponseSenderBlock)successCallback
                  errorCallback: (RCTResponseErrorBlock)errorCallback)
{
  
  TSCellToken *cell;
  
  @try {
    cell  = [self newTokenMode:symmetricKey];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  
  NSData *txt  = [plaintext dataUsingEncoding:NSUTF8StringEncoding];
  NSData *ctx  = [context dataUsingEncoding:NSUTF8StringEncoding];
  TSCellTokenEncryptedResult *result = [cell encrypt:txt context:ctx];
  
    NSArray *encrypted = [Themis dataSerialize: result.encrypted];
    NSArray *token     = [Themis dataSerialize: result.token];
  
  NSDictionary *dictionary = @{
       @"encrypted" : encrypted,
       @"token"     : token
  };
  successCallback(@[dictionary]);
}

RCT_EXPORT_METHOD(tokenProtectDecrypt:(NSArray*) symmetricKey
                  encrypted:(NSArray*) encrypted
                  token:(NSArray*) token
                  context: (NSString*) context
                  successCallback:(RCTResponseSenderBlock)successCallback
                  errorCallback:(RCTResponseErrorBlock)errorCallback
                  )

{
  TSCellToken *cell;
  NSData *enc;
  NSData *tkn;
  
  @try {
    cell  = [self newTokenMode:symmetricKey];
      enc  = [Themis dataDeserialize:encrypted];
      tkn  = [Themis dataDeserialize:token];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  
  NSData *ctx  = [context dataUsingEncoding:NSUTF8StringEncoding];
  
  NSError *error;
  NSData  *decrypted = [cell decrypt:enc
                               token:tkn
                             context:ctx
                               error:&error];
  if (error) {
    errorCallback(error);
  } else {
      NSArray* result = [Themis dataSerialize:decrypted];
    successCallback(@[result]);
  }
  
}


/* MARK: Context imprint mode */

- (TSCellContextImprint *)newContextImprint:(NSArray*) symmetricKey
{
  @try {
      NSData *masterKey = [Themis dataDeserialize: symmetricKey];
    TSCellContextImprint *cell = [[TSCellContextImprint alloc] initWithKey:masterKey];
    return cell;
  }
  @catch (NSException *e) {
    @throw e;
  }
}

RCT_EXPORT_METHOD(contextImprintEncrypt:(NSArray*) symmetricKey
                  plaintext: (NSString*)plaintext
                  context: (NSString*)context
                  successCallback: (RCTResponseSenderBlock)successCallback
                  errorCallback:(RCTResponseErrorBlock)errorCallback)
{
  if (context == nil || [context isEqual: @""]) {
    NSError* error = SCERROR(CONTEXTREQUIRED, @CONTEXTREQUIREDREASON);
    errorCallback(error);
    return;
  }
  
  TSCellContextImprint *cell;
  @try {
    cell  = [self newContextImprint:symmetricKey];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  
  
  NSData *txt  = [plaintext dataUsingEncoding:NSUTF8StringEncoding];
  NSData *ctx  = [context dataUsingEncoding:NSUTF8StringEncoding];
  NSData *encrypted = [cell encrypt:txt context:ctx];
  
    NSArray *result = [Themis dataSerialize:encrypted];

  successCallback(@[result]);
}

RCT_EXPORT_METHOD(contextImprintDecrypt:(NSArray*) symmetricKey
                  encrypted: (NSArray*) encrypted
                  context: (NSString*) context
                  successCallback:(RCTResponseSenderBlock)successCallback
                  errorCallback:(RCTResponseErrorBlock)errorCallback)
{
  
  if (context == nil || [context isEqual: @""]) {
    NSError* error = SCERROR(CONTEXTREQUIRED, @CONTEXTREQUIREDREASON);
    errorCallback(error);
    return;
  }
  
  TSCellContextImprint *cell;
  NSData *enc;
  @try {
    cell = [self newContextImprint:symmetricKey];
      enc  = [Themis dataDeserialize:encrypted];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }

  NSData *ctx  = [context dataUsingEncoding:NSUTF8StringEncoding];
  NSData *decrypted = [cell decrypt:enc
                            context:ctx];
    NSArray* result = [Themis dataSerialize:decrypted];
  successCallback(@[result]);
}

/* MARK: Secure Message */
RCT_EXPORT_METHOD(secureMessageSign:(NSString*) message
                  privateKey:(NSArray*) privateKey
                  publicKey:(NSArray*) publicKey
                  successCallback:(RCTResponseSenderBlock)successCallback
                  errorCallback:(RCTResponseErrorBlock) errorCallback
                  )
{
  
  if (privateKey == nil || privateKey.count == 0) {
    NSError* error = SCERROR(PRIVATEKEYREQUIRED, @PRIVATEKEYREQUIREDREASON);
    errorCallback(error);
    return;
  }
  
  NSData* pvtKey;
  NSData* pubKey;
  @try {
      pvtKey = [Themis dataDeserialize:privateKey];
      pubKey = [Themis dataDeserialize:publicKey];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  
  NSData* msg = [message dataUsingEncoding:NSUTF8StringEncoding];

  TSMessage *secureMessage = [[TSMessage alloc] initInSignVerifyModeWithPrivateKey:pvtKey
                                                peerPublicKey:pubKey];
  
  NSError *error;
  NSData *signedMessage = [secureMessage wrapData:msg error:&error];
  
  if (error) {
    errorCallback(error);
  } else {
      NSArray* result = [Themis dataSerialize:signedMessage];
    successCallback(@[result]);
  }

}

RCT_EXPORT_METHOD(secureMessageVerify:(NSArray*) message
                  privateKey:(NSArray*) privateKey
                  publicKey:(NSArray*) publicKey
                  successCallback:(RCTResponseSenderBlock)successCallback
                  errorCallback:(RCTResponseErrorBlock)errorCallback
                  )
{

  if (publicKey == nil || publicKey.count == 0) {
    NSError* error = SCERROR(PUBLICKEYREQUIRED, @PUBLICKEYREQUIREDREASON);
    errorCallback(error);
    return;
  }
  
  NSData* pvtKey;
  NSData* pubKey;
  NSData* msg;
  
  @try {
      pvtKey = [Themis dataDeserialize:privateKey];
      pubKey = [Themis dataDeserialize:publicKey];
      msg =    [Themis dataDeserialize:message];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
    
  TSMessage *secureMessage = [[TSMessage alloc] initInSignVerifyModeWithPrivateKey:pvtKey
                                                peerPublicKey:pubKey];
  
  NSError *error;

  NSData *verifiedMessage = [secureMessage unwrapData:msg error:&error];
  if (error) {
    errorCallback(error);
  } else {
      NSArray* result = [Themis dataSerialize:verifiedMessage];
    successCallback(@[result]);
  }
}

RCT_EXPORT_METHOD(secureMessageEncrypt:(NSString*) message
                  privateKey:(NSArray*) privateKey
                  publicKey:(NSArray*) publicKey
                  successCallback:(RCTResponseSenderBlock) successCallback
                  errorCallback:(RCTResponseErrorBlock) errorCallback
                  )

{
  
  if (privateKey == nil || privateKey.count == 0) {
    NSError* error = SCERROR(PRIVATEKEYREQUIRED, @PRIVATEKEYREQUIREDREASON);
    errorCallback(error);
    return;
  }

  if (publicKey == nil || publicKey.count == 0) {
    NSError* error = SCERROR(PUBLICKEYREQUIRED, @PUBLICKEYREQUIREDREASON);
    errorCallback(error);
    return;
  }

  NSData* pvtKey;
  NSData* pubKey;
  
  @try {
      pvtKey = [Themis dataDeserialize:privateKey];
      pubKey = [Themis dataDeserialize:publicKey];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  
  NSData* msg =    [message dataUsingEncoding:NSUTF8StringEncoding];

  TSMessage *secureMessage = [[TSMessage alloc] initInEncryptModeWithPrivateKey:pvtKey
                                                                  peerPublicKey:pubKey];
  
  NSError *error;
  NSData *encryptedMessage = [secureMessage wrapData:msg error:&error];
  
  if (error) {
    errorCallback(error);
  } else {
      NSArray* result = [Themis dataSerialize:encryptedMessage];
    successCallback(@[result]);
  }
  
}

RCT_EXPORT_METHOD(secureMessageDecrypt:(NSArray*) message
                  privateKey:(NSArray*) privateKey
                  publicKey:(NSArray*) publicKey
                  successCallback:(RCTResponseSenderBlock) successCallback
                  errorCallback:(RCTResponseErrorBlock) errorCallback
                  )
{
  
  if (privateKey == nil || privateKey.count == 0) {
    NSError* error = SCERROR(PRIVATEKEYREQUIRED, @PRIVATEKEYREQUIREDREASON);
    errorCallback(error);
    return;
  }

  if (publicKey == nil || publicKey.count == 0) {
    NSError* error = SCERROR(PUBLICKEYREQUIRED, @PUBLICKEYREQUIREDREASON);
    errorCallback(error);
    return;
  }
  
  NSData* pvtKey;
  NSData* pubKey;
  NSData* msg;
  
  @try {
      pvtKey = [Themis dataDeserialize:privateKey];
      pubKey = [Themis dataDeserialize:publicKey];
      msg    = [Themis dataDeserialize:message];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  
  TSMessage *secureMessage = [[TSMessage alloc] initInEncryptModeWithPrivateKey:pvtKey
                                                                  peerPublicKey:pubKey];
  
  NSError *error;
  NSData *decryptedMessage = [secureMessage unwrapData:msg error:&error];
  
  if (error) {
    errorCallback(error);
  } else {
      NSArray* result = [Themis dataSerialize:decryptedMessage];
    successCallback(@[result]);
  }
  
}

/* MARK: Comparator */

RCT_EXPORT_METHOD(initComparator:(NSArray*) sharedSecret
                  successCallback:(RCTResponseSenderBlock) successCallback
                  errorCallback:(RCTResponseErrorBlock) errorCallback)
{
  NSData* sharedSecretData;
  
  @try {
      sharedSecretData = [Themis dataDeserialize:sharedSecret];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  TSComparator* cmp = [[TSComparator alloc] initWithMessageToCompare:sharedSecretData];
  NSString *uuid = [[NSUUID UUID] UUIDString];
  cmprs[uuid] = cmp;
  successCallback(@[uuid]);
}

RCT_EXPORT_METHOD(statusOfComparator:(NSString*) uuid
                  successCallback:(RCTResponseSenderBlock) successCallback
                  )
{
  TSComparator* cmp = cmprs[uuid];
  if (cmp == nil) {
    successCallback(@[@-1]);
  } else {
    NSNumber* status = [[NSNumber alloc] initWithInteger:(NSInteger)cmp.status];
    successCallback(@[status]);
  }
}



RCT_EXPORT_METHOD(beginCompare:(NSString*) uuid
                  successCallback:(RCTResponseSenderBlock) successCallback
                  errorCallback:(RCTResponseErrorBlock) errorCallback
                  )
{
  
  TSComparator* cmp = cmprs[uuid];
  if (cmp == nil) {
    errorCallback(nil);
    return;
  }
  NSError* error;

  NSData* data = [cmp beginCompare:&error];
  if (error) {
    errorCallback(error);
  } else {
      NSArray* result = [Themis dataSerialize:data];
    successCallback(@[result]);
  }
}

RCT_EXPORT_METHOD(proceedCompare:(NSString*) uuid
                  previous:(NSArray*) previous
                  successCallback:(RCTResponseSenderBlock) successCallback
                  errorCallback:(RCTResponseErrorBlock) errorCallback
                  )
{
  TSComparator* cmp = cmprs[uuid];
  if ( cmp == nil ) {
    errorCallback(nil);
    return;
  }
  
  NSData* data;
  
  @try {
      data = [Themis dataDeserialize:previous];
  }
  @catch (NSException *e) {
    NSError* error = SCERROR(BYTEOVERFLOW, e.reason);
    errorCallback(error);
    return;
  }
  NSError* error;

  data = [cmp proceedCompare:data error:&error];
  if (error) {
    errorCallback(error);
  } else {
      NSArray* result = [Themis dataSerialize:data];
    NSNumber* status = [[NSNumber alloc] initWithInteger:(NSInteger)cmp.status];
    if (cmp.status != TSComparatorNotReady) {
      [cmprs removeObjectForKey:uuid];
    }
    successCallback(@[result, status]);
  }
  
}


@end

