import { Image } from "expo-image";

type Props = {
  uri: string;
  size?: number;
};

export function Avatar({ uri, size = 64 }: Props) {
  return (
    <Image
      source={uri}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={150}
      placeholder={require("../assets/images/icon.png")}
    />
  );
}
