import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router';

export default function Form({applianceId}) {
  const appliance = useRef(null);
  const [isDisabled, setDisabled] = useState(false);
  const [applianceValue, setApplianceValue] = useState(applianceId || '');
  async function fun() {
    setDisabled(true);

    console.log('hello');
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      console.log("> Scan started");

      ndef.addEventListener("readingerror", () => {
        console.log("Argh! Cannot read data from the NFC tag. Try another one?");
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
    <div className="container">
      <h1 className={styles.title}>
        Contivo <span className={styles.blue}>appliance</span> registration!
      </h1>
      <p className={styles.description}>
        Register the appliance with a CRM project
        {/* <code className={styles.code}>pages/no-js-from.js</code> */}
      </p>

      <form action="/api/form" method="post">
            <label htmlFor="appliance">Appliance ID</label>
          <div style={{ display: 'flex' }}>
            <input value={applianceValue} onChange={(ev) => setApplianceValue(ev.target.value)} style={{ flexGrow : 1, }} type="text" ref={appliance} id="appliance" name="appliance" required />
            <button style={{ width: 'unset', paddingLeft: 10, paddingRight: 10 }} className={styles.scan} disabled={isDisabled} onClick={fun}>🧭</button>
          </div>
        <label htmlFor="crmProject">CRM Project</label>
        <select id="crmProject" name="crmProject" required>
          <option value="62602dbb50d26516d67bc84a,61a904fa66f466f67dd86cf3">Cust1-Infinity</option>
          <option value="62602dbb50d26516d67bc84a,61a904fa66f466f67dd86cf3">Cust1-Beyond</option>
          <option value="62602dbb50d26516d67bc84a,61a904fa66f466f67dd86cf3">Cust1-Happy</option>
        </select>

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export function getServerSideProps({query}) {
  return {
    props: {
      applianceId: query["appliance-id"]
    }
  }
}