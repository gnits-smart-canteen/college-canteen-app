import { db } from "../js/firebase-config.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* GET ALL STUDENTS */
export async function getUsers() {

  const snap =
    await getDocs(
      collection(db, "erp_users")
    );

  const users = {};

  snap.forEach(d => {

    users[d.id] = d.data();

  });

  return users;

}

/* GET ALL ORDERS */

export async function getOrders() {

  const users =
    await getDocs(
      collection(db, "erp_users")
    );

  let orders = [];

  users.forEach(docSnap => {

    const data =
      docSnap.data();

    if (data.orders) {

      data.orders.forEach(order => {

        orders.push({

          ...order,

          roll:
            docSnap.id

        });

      });

    }

  });

  return orders;

}

/* UPDATE ORDER STATUS */

export async function updateOrderStatus(
  roll,
  orderId,
  status
) {

  const ref =
    doc(
      db,
      "erp_users",
      roll
    );

  const snap =
    await getDoc(ref);

  const data =
    snap.data();

  const orders =
    data.orders || [];

  const updated =
    orders.map(o => {

      if (o.id === orderId) {

        o.status =
          status;

      }

      return o;

    });

  await updateDoc(
    ref,
    {
      orders:
        updated
    }
  );

}
