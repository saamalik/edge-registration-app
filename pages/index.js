import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Form() {
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

        <label htmlFor="last">CRM Project</label>
        <select id="project" name="project" required>
          <option value="abc">Abc</option>
        </select>

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
