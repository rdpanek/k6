/**
 * ./k6.1.0.0.kafka run --vus 50 --duration 60s demos/01-sandbox/kafka-protobuf.js
 */

import { Writer, Reader } from 'k6/x/kafka';
import { encodeUser, decodeUser } from '../../demos/protobuf/user_pb.js';

const brokers = ['localhost:9092'];
const topic = 'proto-topic2';

const writer = new Writer({ brokers, topic });
const reader = new Reader({ brokers, topic });

export default function () {
  // 1. Vytvoř uživatele jako JS objekt
  const user = { id: '1', name: 'Alice', age: 30 };
  // 2. Serializuj do Protobuf binárního bufferu
  const buffer = encodeUser(user);
  // 3. Pošli zprávu do Kafka topicu
  writer.produce({
    messages: [
      {
        key: 'user-key',
        value: buffer, // binární data
      },
    ],
  });

  // 4. Přečti zprávu z topicu
  const messages = reader.consume({ limit: 1 });
  if (messages.length > 0) {
    // 5. Deserializuj zpět na objekt
    const decoded = decodeUser(messages[0].value);
    console.log(JSON.stringify(decoded));
  }
}