const myVpc = ec2.Vpc.fromLookup(this, "external-vpc", {
   vpcId: ''
    });

    const Admin = new iam.Role(this, "Admin", {
      assumedBy: new iam.AccountRootPrincipal(),
      path: "/",
    });

    // The IAM role that will be used by EKS
    const clusterRole = new iam.Role(this, "ClusterRole", {
      assumedBy: new iam.ServicePrincipal("eks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
      ]
    });

   

   
    const ekscluster = new eks.Cluster(this, "demo-cluster", {
      clusterName: `demo-eks-cluster`,
      mastersRole: Admin,
      kubectlLayer: new kl.KubectlV23Layer(this, "kubectl-layer"),
      version: eks.KubernetesVersion.V1_23,
      vpc: myVpc,
      defaultCapacity: 0,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PUBLIC }],
      role: clusterRole,
      

    });
  
