declare module "sharp" {
  interface SharpInstance {
    jpeg(options: { quality: number }): SharpInstance;
    toBuffer(): Promise<Buffer>;
  }
  export default function sharp(input: Buffer): SharpInstance;
}
