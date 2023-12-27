import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as es from 'aws-cdk-lib/aws-elasticsearch'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import {execSync} from 'child_process'
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as r53 from 'aws-cdk-lib/aws-route53'
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkSetupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const output = execSync('python3 scripts/fetch_log_group.py').toString();
    const log_group: string[] = JSON.parse(output);
    console.log(log_group);

    const executionRole = new iam.Role(this, 'ExecutionRole', {
      assumedBy: new iam.ServicePrincipal('logs.amazonaws.com'),
    });

   

    executionRole.addToPolicy(new iam.PolicyStatement({
      actions: ['logs:*'],
      resources: ['*'],
    }))

    const handler = new lambda.Function(this, 'Lambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName: "sample-test-lambda",
      handler: 'handler.handler',
      role: executionRole,
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda')),
    });

    const perms = new lambda.CfnPermission(this, 'LambdaPermission', {
      action: 'lambda:InvokeFunction',
      functionName: handler.functionName,
      principal: 'logs.amazonaws.com',
      sourceAccount: '',

    });

  

    for (const log_groupname of log_group) {
      const sam = new logs.CfnSubscriptionFilter(this, `Subfilter${log_groupname}`, {
          logGroupName: log_groupname,
          filterPattern: 'ERROR',  
          destinationArn: handler.functionArn,
      });

      sam.node.addDependency(handler);
  }



  }
}
