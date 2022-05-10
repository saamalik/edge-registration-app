import Client from './client'

interface Credentials {
  host: string;
  username: string;
  password: string;
}

export async function getKubeconfigFromSpectroCloud(c: Client, projectName: string, clusterName: string) {
  // const c = new Client(cred.host, cred.username, cred.password);
  const projectUid = await c.getProjectUID(projectName);
  const clusterUid = await c.getClusterUID(projectUid, clusterName);
  const kubeconfig = await c.getClusterKubeconfig(projectUid, clusterUid);
  return kubeconfig;
}

export async function doesEdgeApplianceExist(c: Client, projectUid: string, edgeUid: string) {
  try {
    await c.getEdgeAppliance(projectUid, edgeUid);
    return true;
  } catch (e) {
    return false;
  }
}

export async function createCluster(c: Client, projectUid: string, clusterName: string) {
  const clusterData = {
    metadata: {
      name: clusterName,
      labels: {
        imported: "false",
      }
    },
    spec: {}
  }

  const clusterUid = await c.importCluster(projectUid, 'generic', clusterData);
  return clusterUid;
}

export async function getOrCreateCluster(c: Client, projectUid: string, clusterName: string) {
  try {
    const clusterUid = await c.getClusterUID(projectUid, clusterName);
    console.log("Found existing cluster", clusterUid, clusterName);
    return clusterUid;
  } catch(e) {
    console.log("Creating new cluster", clusterName);
    const clusterUid = await createCluster(c, projectUid, clusterName);
    console.log("Created new cluster", clusterUid, clusterName);
    return clusterUid;
  }
}

export default async function handler(req, res) {
  const body = req.body
  console.log('body: ', body)
  const appliance = body.appliance;
  const [clusterName,crmProject] = body.store.split(";");

  const scApi = process.env.SC_API
  const scUser = process.env.SC_USER
  const scPassword = process.env.SC_PASSWORD

  console.log("New request: ", appliance, crmProject)

  if (!appliance || !clusterName || !crmProject) {
    return res.json({ data: 'appliance or crmProject name not found' })
  }

  const c = new Client(scApi, scUser, scPassword);
  // const kubeconfig = await getKubeconfigFromSpectroCloud(c, "Default", "vmware-prod-2");
  const projectUid = await c.getProjectUID("Default");
  const alreadyExists = await doesEdgeApplianceExist(c, projectUid, appliance);
  if (alreadyExists) {
    console.log("It already exists! - ");
    return res.redirect(303, '/already')
  }

  const clusterUid = await getOrCreateCluster(c, projectUid, clusterName);
  console.log("Cluster UID:", clusterUid);

  const attachProfile = {
    profiles: crmProject.split(",").map(a => ({ uid: a})),
  }

  const profile = await c.attachProfiles(projectUid, clusterUid, attachProfile);
  console.log("Attached Cluster profiles", crmProject);

  console.log("Creating new edge appliance");
  const data = {
    metadata: {
      name: appliance,
      uid: appliance,
      labels: {
        cluster: clusterUid,
      }
    },
  }

  const applianceUid = await c.createEdgeAppliance(projectUid, data);
  console.log("Appliance UID:", applianceUid);

  res.redirect(303, '/registered')

  // Both of these are required.
  // if (!body.first || !body.last) {
  //   return res.json({ data: 'First or last name not found' })
  // }

  // // Found the name.
  // res.json({ data: `${body.first} ${body.last}` })
}
