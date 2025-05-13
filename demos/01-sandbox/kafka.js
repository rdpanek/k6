/**
 * ./k6.0.57.kafka run --vus 50 --duration 60s demos/01-sandbox/kafka.js
 */


// Either import the module object
import * as kafka from "k6/x/kafka";

// Or individual classes and constants
import {
    Writer,
    Reader,
    Connection,
    SchemaRegistry,
    SCHEMA_TYPE_STRING,
} from "k6/x/kafka";

// Creates a new Writer object to produce messages to Kafka
const writer = new Writer({
  // WriterConfig object
  brokers: ["localhost:9092"],
  topic: "my-topic",
});

const reader = new Reader({
  // ReaderConfig object
  brokers: ["localhost:9092"],
  topic: "my-topic",
});

const connection = new Connection({
  // ConnectionConfig object
  address: "localhost:9092",
});

const schemaRegistry = new SchemaRegistry();
// Can accept a SchemaRegistryConfig object

if (__VU == 0) {
  // Create a topic on initialization (before producing messages)
  connection.createTopic({
  // TopicConfig object
  topic: "my-topic",
  });
}

export default function () {
  // Fetch the list of all topics
  const topics = connection.listTopics();
  console.log(topics); // list of topics

  // Produces message to Kafka
  writer.produce({
  // ProduceConfig object
  messages: [
      // Message object(s)
      {
      key: schemaRegistry.serialize({
          data: "my-key",
          schemaType: SCHEMA_TYPE_STRING,
      }),
      value: schemaRegistry.serialize({
          data: "my-value",
          schemaType: SCHEMA_TYPE_STRING,
      }),
      },
  ],
  });

  // Consume messages from Kafka
  let messages = reader.consume({
  // ConsumeConfig object
  limit: 10,
  });

  // your messages
  console.log(messages);

  // You can use checks to verify the contents,
  // length and other properties of the message(s)

  // To serialize the data back into a string, you should use
  // the deserialize method of the Schema Registry client. You
  // can use it inside a check, as shown in the example scripts.
  let deserializedValue = schemaRegistry.deserialize({
  data: messages[0].value,
  schemaType: SCHEMA_TYPE_STRING,
  });
}

export function teardown(data) {
  // Delete the topic
  connection.deleteTopic("my-topic");

  // Close all connections
  writer.close();
  reader.close();
  connection.close();
}