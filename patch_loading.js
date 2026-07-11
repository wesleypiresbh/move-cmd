const fs = require('fs');
let code = fs.readFileSync('lib/StoreProvider.tsx', 'utf8');

code = code.replace(
  /addMessage: \(msg: Omit<Message, 'id' | 'timestamp'>\) => Promise<void>;\n\};/,
  "addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;\n  loading: boolean;\n};"
);

code = code.replace(
  /const \[messages, setMessages\] = useState<Message\[\]>\(\[\]\);/,
  "const [messages, setMessages] = useState<Message[]>([]);\n  const [loading, setLoading] = useState(true);"
);

code = code.replace(
  /setCurrentUser\(null\);\n\s*\}\n\s*\}, \(error\) => \{/,
  "setCurrentUser(null);\n          }\n          setLoading(false);\n        }, (error) => {\n          setLoading(false);"
);

code = code.replace(
  /\} else \{\n\s*setCurrentUser\(null\);\n\s*\}/,
  "} else {\n        setCurrentUser(null);\n        setLoading(false);\n      }"
);

code = code.replace(
  /messages, addMessage \}\}>/,
  "messages, addMessage, loading }}>"
);

fs.writeFileSync('lib/StoreProvider.tsx', code);
