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
  name: "Acme",
  accentColor: "#0070f3",
  logo: "data:image/png;base64,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",
  selectionLabel: 'Store',
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
