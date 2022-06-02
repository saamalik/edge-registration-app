import { faCog, faShareAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { folder, Leva, useControls } from "leva";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import styles from "./DemoSettings.module.css";
const DemoSettingsContext = createContext(null);
import lscache from "lscache";
import ClipboardJS from "clipboard";
import { useRouter } from "next/router";
import useSSR from "components/common/SSR";

export default function useDemoControls() {
  return useContext(DemoSettingsContext).controls;
}

const dataURItoBlob = function (dataURI) {
  if (!dataURI) {
    return new Blob([]);
  }

  const bytes =
    dataURI.split(',')[0].indexOf('base64') >= 0
      ? atob(dataURI.split(',')[1])
      : unescape(dataURI.split(',')[1]);
  const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const max = bytes.length;
  const ia = new Uint8Array(max);
  for (let i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i);
  return new Blob([ia], { type: mime });
};

let canvas = null;
if (typeof window !== 'undefined') {
  canvas = document.createElement('canvas');
}
function resizeImage(blob, settings) {
  return new Promise((resolve) => {
    const maxSize = settings.maxSize;
    const image = new Image();
    image.src = blob;
    image.onload = function () {
      let width = image.width;
      let height = image.height;
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    }
  })
};

async function stringifySettings(controls) {
  const resizedImg = await resizeImage(controls.logo, { maxSize: 100 });
  console.log(controls.logo, resizedImg)
  return { ...controls, logo: resizedImg }
}

function encodeObject(obj) {
  return btoa(JSON.stringify(obj));
}

function decodeObject(str) {
  let settings = "{}";
  try {
    settings = atob(str)
  } catch (e) {}
  return JSON.parse(settings);
}


const ACME_SETTINGS = {
  name: "GEHC",
  accentColor: "#0070f3",
  logo: "data:image/png;base64,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",
  selectionLabel: 'Hospital',
  backgroundColor: "#fff",
  textColor: "#000",
}

export function DemoSettingsProvider({ children }: { children: React.ReactNode }) {
  const defaultSettings = lscache.get("demo-settings") || ACME_SETTINGS;
  const shareBtn = useRef(null);
  const router = useRouter();
  const isSSR = useSSR();

  const [controls, set] = useControls(() => ({
    company: folder({
      name: defaultSettings.name,
      accentColor: defaultSettings.accentColor,
      logo: {
        image: defaultSettings.logo,
      }
    }),
    ui: folder({
      selectionLabel: {
        value: defaultSettings.selectionLabel,
        options: [
          "Store",
          "Hospital",
          "Device Location"
        ]
      },
      backgroundColor: defaultSettings.backgroundColor,
      textColor: defaultSettings.textColor,
    })
  }));
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = useCallback(() => {
    setShowSettings(state => !state);
  }, [setShowSettings])

  useEffect(() => {
    const styleElem = document.getElementById('theming') || document.createElement('style');
    styleElem.id = "theming"
    styleElem.innerHTML = `
      :root {
        --accentColor: ${controls.accentColor};
        --backgroundColor: ${controls.backgroundColor};
        --textColor: ${controls.textColor};
      }
    `

    if (!document.getElementById('theming')) {
      document.head.appendChild(styleElem);
    }
  }, [controls])

  useEffect(() => {
    async function persistToCache() {
      lscache.set('demo-settings', await stringifySettings(controls));
    }

    persistToCache();
  }, [controls])

  useEffect(() => {
    async function createCopyButton() {
      if (showSettings && shareBtn.current) {
        const settings = encodeObject(await stringifySettings(controls))
        new ClipboardJS(shareBtn.current, {
          text: function (trigger) {
            return `${window.location.href.split('?')[0]}?settings=${settings}`;
          }
        });
      }
    }

    createCopyButton();
  }, [showSettings, controls])

  useEffect(() => {
    if (!isSSR && router.query.settings) {
      const settings = decodeObject(router.query.settings);
      set({ ...settings, logo: URL.createObjectURL(dataURItoBlob(settings.logo)) });
      router.replace(router.pathname, null, { shallow: true });
    }
  }, [router.query.settings, set, isSSR, router])

  return (
    <DemoSettingsContext.Provider value={{ controls, showSettings, toggleSettings }}>
      {children}
      {showSettings ? <Leva titleBar={false} /> : null}
      <div className={`${styles.settingsButtons} ${showSettings ? styles.withSettings : ""}`}>
        <button className={styles.settingsBtn} onClick={toggleSettings}><FontAwesomeIcon icon={faCog} /></button>
        {showSettings ? (
          <>
            <button data-secondary ref={shareBtn} className={styles.settingsBtn}><FontAwesomeIcon icon={faShareAlt} /></button>
            <button data-secondary className={styles.settingsBtn} onClick={() => {
              set({ ...ACME_SETTINGS, logo: URL.createObjectURL(dataURItoBlob(ACME_SETTINGS.logo)) });
            }}><FontAwesomeIcon icon={faTrashAlt} /></button>
          </>
        ) : null}
      </div>
    </DemoSettingsContext.Provider>
  )
}

