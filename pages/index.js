import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Form() {

  useEffect( () => {
    async function nfc() {
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
        });
      } catch (error) {
        console.log("Argh! " + error);
      }

    }
    nfc();


  });
  return (
    <div className="container">
      <h1 className={styles.title}>
        Contivo <span className={styles.blue}>appliance</span> registration!
      </h1>
      <p className={styles.description}>
        Register the appliance with a CRM project
        {/* <code className={styles.code}>pages/no-js-from.js</code> */}
      </p>

      {/*action: The action attribute defines where the data gets sent. Its value must be a valid relative or absolute URL. If this attribute isn't provided, the data will be sent to the URL of the page containing the form — the current page.
	method: The HTTP method to submit the form with. (case insensitive) s*/}

      <form action="/api/form" method="post">
        <label htmlFor="appliance">Appliance ID</label>
        <input type="text" id="appliance" name="appliance" required />

        <label htmlFor="crmProject">CRM Project</label>
        <select id="crmProject" name="crmProject" required>
          <option value="61a904fa66f466f67dd86cf3">Cust1-Infinity</option>
          <option value="61a904fa66f466f67dd86cf3">Cust1-Beyond</option>
          <option value="61a904fa66f466f67dd86cf3">Cust1-Happy</option>
        </select>

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
