import ShortUniqueId from "short-unique-id"; // is slow

export class NanoidHelper {
  /**
   * Generate a unique identifier similar to NanoID.
   *
   * @param size Length of the generated id
   * @returns Random id consisting of the given number of characters
   */
  public static async getNanoid(size: number): Promise<string> {
    const uid = new ShortUniqueId({ length: size });
    return uid.randomUUID(size);

   
  }
}
