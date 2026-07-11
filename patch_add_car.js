const fs = require('fs');
let code = fs.readFileSync('lib/StoreProvider.tsx', 'utf8');

// add addCar to AppState
code = code.replace(
  /deleteUser: \(id: string\) => Promise<void>;/,
  "deleteUser: (id: string) => Promise<void>;\n  addCar: (carData: Omit<Car, 'id'>) => Promise<void>;"
);

// add addCar function
const addCarFunc = `
  const addCar = async (carData: Omit<Car, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'cars', newId), {
        ...carData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'cars');
      throw error; // Rethrow to show alert
    }
  };
`;

code = code.replace(
  /const deleteUser = async \(id: string\) => \{/,
  addCarFunc + "\n  const deleteUser = async (id: string) => {"
);

// add addCar to AppContext.Provider value
code = code.replace(
  /deleteUser,\s*addRide/g,
  "deleteUser,\n        addCar,\n        addRide"
);

fs.writeFileSync('lib/StoreProvider.tsx', code);
