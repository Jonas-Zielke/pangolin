import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    createHash
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits

function getKey(key: string): Buffer {
    return createHash("sha256").update(key).digest();
}

export function encrypt(value: string, key: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getKey(key), iv);
    const encrypted = Buffer.concat([
        cipher.update(value, "utf8"),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(encryptedValue: string, key: string): string {
    const data = Buffer.from(encryptedValue, "base64");
    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
    const text = data.subarray(IV_LENGTH + 16);
    const decipher = createDecipheriv(ALGORITHM, getKey(key), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
    return decrypted.toString("utf8");
}
