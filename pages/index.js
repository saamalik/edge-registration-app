import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import useDemoControls from "components/common/DemoSettings";
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

  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);

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
        {isSSR ? (
          null
        ) : <img className={styles.logo} src={logo} alt="demo logo" />}
      </div>
      <h1 className={styles.title}>
        {name} <span className="accent">appliance</span> registration!
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
            style={{ width: "unset", paddingLeft: 10, paddingRight: 10 }}
            className={styles.scan}
            disabled={isDisabled}
            onClick={fun}
          >
            🧭
          </button>
        </div>
        <label htmlFor="crmProject">{selectionLabel}</label>
        <select id="store" name="store" required>
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
          <option value="edge-dallas;62753e05f245ae150c1a3c65,62753eadf245ae15ae76a4cb">
            Dallas, TX - BBQ St
          </option>
          <option value="edge-sanjose;627a4962f245b23834eb4766,61a904fa66f466f67dd86cf3">
            San Jose, Ca - Hopper St
          </option>
          <option value="edge-lasvegas;627a4962f245b23834eb4766,61a904fa66f466f67dd86cf3">
            Las Vegas, NV - Party Rd
          </option>
          <option value="edge-whitefish;627e94767c90aaab2cfd97a3,627e94b17c90aaab5a71a8b5">
            Whitefish, MT - Parkway Dr
          </option>
          <option value="edge-phoenix;628bdec37c90b4bf16481eb1,628be14c7c90b4c1110e633e">
            Phoenix, AZ - Suns Ave
          </option>
          <option value="edge-cambridge;627a4962f245b23834eb4766,61a904fa66f466f67dd86cf3">
            Cambridge, MA - Main St
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
