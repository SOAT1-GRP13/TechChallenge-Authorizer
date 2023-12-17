import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "us-west-2" });

export const handler = async (event, context) => {

    if(event.rawPath.includes('auth')){
        return generatePolicy('user', 'Allow', event.routeArn)
    }

    const exists = await getDynamoToken(event.headers.authorization);


    if (exists) {
        return generatePolicy('user', 'Allow', event.routeArn)
    }

    return generatePolicy('user', 'Deny', event.routeArn)
};

function generatePolicy(principalId, effect, resource) {
    return {
        'principalId': principalId,
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [{
                'Action': 'execute-api:Invoke',
                'Effect': effect,
                'Resource': resource
            }]
        }
    };
}

async function getDynamoToken(authToken) {
    const input = {
        Key: {
            token: {
                S: authToken,
            },
        },
        TableName: "usuariosLogados",
    };

    const command = new GetItemCommand(input);
    const dynamoResponse = await client.send(command);

    if (dynamoResponse.Item === undefined) {
        return false;
    }

    return true
    //   const dynamoUnmarshall = unmarshall(dynamoResponse.Item);

    //   return dynamoUnmarshall;
}
