import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faCompass } from "@fortawesome/free-solid-svg-icons";
import useDemoControls from "components/common/DemoSettings";
import useSSR from "components/common/SSR";
import Image from "next/image";

export default function Form({ applianceId }) {
  const appliance = useRef(null);
  const [isDisabled, setDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applianceValue, setApplianceValue] = useState(applianceId || "");

  const { name, selectionLabel, logo } = useDemoControls();

  async function fun() {
    setDisabled(true);

    console.log("hello");
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      console.log("> Scan started");

      ndef.addEventListener("readingerror", () => {
        console.log(
          "Argh! Cannot read data from the NFC tag. Try another one?"
        );
      });

      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        console.log(`> Serial Number: ${serialNumber}`);
        console.log(`> Records: (${message.records.length})`);

        const decoder = new TextDecoder();
        for (const record of message.records) {
          if (record.recordType === "text") {
            const data = decoder.decode(record.data);
            console.log(`data ${data}`);

            appliance.current.value = data;
            // const article =/^[aeio]/i.test(json.title) ? "an" : "a";
            // console.log(`${json.name} is ${article} ${json.title}`);
          }
        }
      });
    } catch (error) {
      console.log("Argh! " + error);
    }
  }

  const isSSR = useSSR();

  // useEffect( () => {
  //   async function nfc() {
  //     try {
  //       const ndef = new NDEFReader();
  //       await ndef.scan();
  //       console.log("> Scan started");

  //       ndef.addEventListener("readingerror", () => {
  //         console.log("Argh! Cannot read data from the NFC tag. Try another one?");
  //       });

  //       ndef.addEventListener("reading", ({ message, serialNumber }) => {
  //         console.log(`> Serial Number: ${serialNumber}`);
  //         console.log(`> Records: (${message.records.length})`);
  //       });
  //     } catch (error) {
  //       console.log("Argh! " + error);
  //     }

  //   }
  //   nfc();

  // });
  return (
    <div className={styles.container}>
      <div className={styles.logoWrap}>
        {isSSR ? null : (
          <img className={styles.logo} src={logo} alt="demo logo" />
        )}
      </div>
      <h1 className={styles.title}>
      <span className="accent">{name}</span> appliance registration!
      </h1>
      <p className={styles.description}>
        Register the appliance with a CRM project
        {/* <code className={styles.code}>pages/no-js-from.js</code> */}
      </p>

      <form
        action="/api/form"
        method="post"
        onSubmit={() => setIsSubmitting(true)}
      >
        <label htmlFor="appliance">Appliance ID</label>
        <div style={{ display: "flex" }}>
          <input
            value={applianceValue}
            onChange={(ev) => setApplianceValue(ev.target.value)}
            style={{ flexGrow: 1 }}
            type="text"
            ref={appliance}
            id="appliance"
            name="appliance"
            required
          />
          <button
            className={styles.scan}
            disabled={isDisabled}
            onClick={fun}
          >
            <FontAwesomeIcon icon={faCompass} />
          </button>
        </div>
        <label htmlFor="crmProject">{selectionLabel}</label>
        <select id="store" name="store" required>
          <option value="edge-london;628ce30a7c90b5915b37a802,628ce30a7c90b591598ef64c">
            London, UK - Regent St
          </option>
          <option value="edge-pittsburgh;628ce30a7c90b5915b37a802,628ce30a7c90b591598ef64c">
            Pittsburgh, PA - Penguin St
          </option>
          <option value="edge-hollywood;628ce30a7c90b5915b37a802,628ce30a7c90b591598ef64c">
            Hollywood, Ca - Harry St
          </option>
          <option value="edge-miami;628ce30a7c90b5915b37a802,628ce30a7c90b591598ef64c">
            Miami, FL - Beach St
          </option>
          <option value="edge-denver;628ce30a7c90b5915b37a802,628ce30a7c90b591598ef64c">
            Denver, CO - Snow St
          </option>
          <option value="edge-newyork;628ce30a7c90b5915b37a802,628ce30a7c90b591598ef64c">
            New York, NW - Wall St
          </option>
          <option value="edge-dallas;6297c9e4b21e6e26f2cac6bb,62984b20b21e6e4972f07726">
            Dallas, TX - BBQ St
          </option>
          <option value="edge-sanjose;627a4962f245b23834eb4766,61a904fa66f466f67dd86cf3">
            San Jose, Ca - Hopper St
          </option>
          <option value="edge-milwaukee;62a96c6f4575048ec4495496,62a97922457504988e543a7a">
            Milwaukee, WI - Tower Ave
          </option>
          <option value="edge-sanjose;627a4962f245b23834eb4766,61a904fa66f466f67dd86cf3">
            San Jose, Ca - Hopper St
          </option>
          <option value="edge-lasvegas;627a4962f245b23834eb4766,61a904fa66f466f67dd86cf3">
            Las Vegas, NV - Party Rd
          </option>
          <option value="edge-whitefish;6297c9e4b21e6e26f2cac6bb,62984b20b21e6e4972f07726">
            Whitefish, MT - Parkway Dr
          </option>
          <option value="edge-phoenix;629900a318c34b8e484bb6b8,629900be18c34b8e513c47e3">
            Phoenix, AZ - Suns Ave
          </option>
          <option value="edge-milwaukee-1;629900a318c34b8e484bb6b8,629900be18c34b8e513c47e3">
            Milwaukee, WI - Tower Ave OLD
          </option>
        </select>

        <button type="submit" disabled={isSubmitting}>
          Submit
          {isSubmitting ? <FontAwesomeIcon icon={faCircleNotch} spin /> : null}
        </button>
      </form>
    </div>
  );
}

export function getServerSideProps({ query }) {
  return {
    props: {
      applianceId: query["appliance-id"] || "",
    },
  };
}
