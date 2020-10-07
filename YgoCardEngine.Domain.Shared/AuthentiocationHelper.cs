using System;
using NETCore.Encrypt;

namespace YgoCardEngine.Domain.Shared
{
    public class AuthentiocationHelper
    {

        /// <summary>
        /// 密文解析
        /// </summary>
        /// <param name="encryptedStr">密文</param>
        /// <returns>用户id，解密失败则为null</returns>
        public static string Check(string encryptedStr, string key, string vector)
        {
            //timestamp=id
            try
            {
                var encrypted = EncryptProvider.AESEncrypt(encryptedStr, key, vector);
                var decrypted = EncryptProvider.AESDecrypt(encrypted, key, vector).Split('=');

                var timeStamp = DateTimeOffset.Now.ToUnixTimeSeconds();


                if (Convert.ToInt64(decrypted[0]) + 60 > timeStamp && Convert.ToInt64(decrypted[0]) - 60 < timeStamp)
                {
                    return decrypted[1];
                }
            }
            catch
            {
                return null;
            }
            return null;
        }
    }
}
