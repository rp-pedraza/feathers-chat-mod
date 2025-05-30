import { createHash } from "crypto";

const getGravatarUri = (() => {
  const gravatarCache: { [key: string]: string | undefined } = {};

  const generateGravatarUri = (email: string, size: number) => {
    // Gravatar uses SHA256 hashes from an email address to get the image
    const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
    return `https://s.gravatar.com/avatar/${hash}?s=${size}`;
  };

  return (email: string | null | undefined, size: number = 60): string | undefined => {
    const key = `${email}|${size}`;
    return email ? (gravatarCache[key] ??= generateGravatarUri(email, size)) : undefined;
  };
})();

export default getGravatarUri;
