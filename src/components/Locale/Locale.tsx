// @ts-strict-ignore
import useLocalStorage from "@dashboard/hooks/useLocalStorage";
import React, { useRef } from "react";
import { IntlProvider, ReactIntlErrorCode } from "react-intl";

export enum Locale {
  AR = "ar",
  AZ = "az",
  BG = "bg",
  BN = "bn",
  CA = "ca",
  CS = "cs",
  DA = "da",
  DE = "de",
  EL = "el",
  EN = "en",
  ES = "es",
  ES_CO = "es-CO",
  ET = "et",
  FA = "fa",
  FR = "fr",
  HI = "hi",
  HU = "hu",
  HY = "hy",
  ID = "id",
  IS = "is",
  IT = "it",
  JA = "ja",
  KO = "ko",
  MN = "mn",
  NB = "nb",
  NL = "nl",
  PL = "pl",
  PT = "pt",
  PT_BR = "pt-BR",
  RO = "ro",
  RU = "ru",
  SK = "sk",
  SL = "sl",
  SQ = "sq",
  SR = "sr",
  SV = "sv",
  TH = "th",
  TR = "tr",
  UK = "uk",
  VI = "vi",
  ZH_HANS = "zh-Hans",
  ZH_HANT = "zh-Hant",
}

interface StructuredMessage {
  context?: string;
  string: string;
}
type LocaleMessages = Record<string, StructuredMessage>;

export const localeNames: Record<Locale, string> = {
  [Locale.AR]: "العربيّة",
  [Locale.AZ]: "Azərbaycanca",
  [Locale.BG]: "български",
  [Locale.BN]: "বাংলা",
  [Locale.CA]: "català",
  [Locale.CS]: "česky",
  [Locale.DA]: "dansk",
  [Locale.DE]: "Deutsch",
  [Locale.EL]: "Ελληνικά",
  [Locale.EN]: "English",
  [Locale.ES]: "español",
  [Locale.ES_CO]: "español de Colombia",
  [Locale.ET]: "eesti",
  [Locale.FA]: "فارسی",
  [Locale.FR]: "français",
  [Locale.HI]: "Hindi",
  [Locale.HU]: "Magyar",
  [Locale.HY]: "հայերեն",
  [Locale.ID]: "Bahasa Indonesia",
  [Locale.IS]: "Íslenska",
  [Locale.IT]: "italiano",
  [Locale.JA]: "日本語",
  [Locale.KO]: "한국어",
  [Locale.MN]: "Mongolian",
  [Locale.NB]: "norsk (bokmål)",
  [Locale.NL]: "Nederlands",
  [Locale.PL]: "polski",
  [Locale.PT]: "Português",
  [Locale.PT_BR]: "Português Brasileiro",
  [Locale.RO]: "Română",
  [Locale.RU]: "Русский",
  [Locale.SK]: "Slovensky",
  [Locale.SL]: "Slovenščina",
  [Locale.SQ]: "shqip",
  [Locale.SR]: "српски",
  [Locale.SV]: "svenska",
  [Locale.TH]: "ภาษาไทย",
  [Locale.TR]: "Türkçe",
  [Locale.UK]: "Українська",
  [Locale.VI]: "Tiếng Việt",
  [Locale.ZH_HANS]: "简体中文",
  [Locale.ZH_HANT]: "繁體中文",
};

const dotSeparator = "_dot_";
const sepRegExp = new RegExp(dotSeparator, "g");

function getKeyValueJson(messages: LocaleMessages): Record<string, string> {
  if (messages) {
    const keyValueMessages: Record<string, string> = {};

    return Object.entries(messages).reduce((acc, [id, msg]) => {
      acc[id.replace(sepRegExp, ".")] = msg.string;

      return acc;
    }, keyValueMessages);
  }
}

const localeCode = process.env.LOCALE_CODE || "EN";
const defaultLocale = Locale[localeCode];

export interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}
export const LocaleContext = React.createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => undefined,
});

const { Consumer: LocaleConsumer, Provider: RawLocaleProvider } = LocaleContext;
const LocaleProvider: React.FC = ({ children }) => {
  const [locale, setLocale] = useLocalStorage("locale", defaultLocale);
  const [messages, setMessages] = React.useState(undefined);
  const loaded = useRef(false);

  React.useEffect(() => {
    async function changeLocale() {
      if (locale !== Locale.EN && !loaded.current) {
        // It seems like Webpack is unable to use aliases for lazy imports
        const mod = await import(`../../../locale/${locale}.json`);

        setMessages(mod.default);

        if (!loaded.current) {
          loaded.current = true;
        }
      } else {
        setMessages(undefined);
      }
    }

    changeLocale();
  }, [locale]);

  return (
    <IntlProvider
      defaultLocale={defaultLocale}
      locale={locale}
      messages={getKeyValueJson(messages)}
      onError={err => {
        if (!(err.code === ReactIntlErrorCode.MISSING_TRANSLATION)) {
          console.error(err);
        }
      }}
      key={locale}
    >
      <RawLocaleProvider
        value={{
          locale,
          setLocale,
        }}
      >
        {children}
      </RawLocaleProvider>
    </IntlProvider>
  );
};

export { LocaleConsumer, LocaleProvider, RawLocaleProvider };
