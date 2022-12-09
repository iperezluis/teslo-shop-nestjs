import { SNSClient } from '@aws-sdk/client-sns';
// Set the AWS Region.
// const REGION = 'REGION'; //e.g. "us-east-1"
// Create SNS service object.
export const awsSNS = () =>
  new SNSClient({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_PUBLIC_KEY,
      secretAccessKey: process.env.AWS_PRIVATE_KEY,
    },
  });

// Set the parameters
// const params: SubscribeCommandInput = {
//   Protocol: '' /* required */,
//   TopicArn: process.env.AWS_TOPIC_SNS, //TOPIC_ARN
//   Endpoint: 'perezvluisv@gmail.com', //EMAIL_ADDRESS
// };

// // const command = new SubscribeCommand(params);
// const parameters: PublishCommandInput = {
//   Subject: 'Creacion exitosa',
//   // TopicArn: process.env.AWS_TOPIC_SNS,
//   Message: `<h3>Su cuenta hasido creada exitosamente</h3>`,
//   PhoneNumber: '+584141582912',

//   // MessageStructure:
// };
// const commands = new PublishCommand(parameters);

// const data = await awsSNS().send(commands);
