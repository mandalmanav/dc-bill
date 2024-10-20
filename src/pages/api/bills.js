import mysql from 'mysql2/promise';
import axios from 'axios';
const sendSmsUsingMsg91 = async (
  authKey,
  senderId,
  message,
  mobile,
  Dlt_Template_Id,
  Registration_Id
) => {
  const url = `https://api.msg91.com/api/sendhttp.php?authkey=${authKey}&sender=${senderId}&route=4&message=${encodeURIComponent(
    message
  )}&mobiles=${mobile}&DLT_TE_ID=${Dlt_Template_Id}&PE_ID=${Registration_Id}`;
  try {
  axios.get(url);
    //console.log(result);
    // return { status: result.status, resultData: result.data };
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle creating a new bill
    const { name, phone, amount } = req.body;

    // Basic validation
    if (!name || !phone || !amount) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      // Connect to MySQL database
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST, // Replace with your DB host
        user: process.env.MYSQL_USER, // Replace with your DB user
        password: process.env.MYSQL_PWD, // Replace with your DB password
        database: process.env.MYSQL_DB, // Replace with your DB name
      });

      // Insert into bills table
      const query = `
        INSERT INTO bills (name, phone, amount)
        VALUES (?, ?, ?)
      `;
      const values = [name, phone, amount];
      const [result] = await connection.execute(query, values);

      // Close the connection
       await connection.end();
       try{
        sendSmsUsingMsg91(
          process.env.MSG91_AUTH_KEY,
          process.env.SENDER_ID,
          `Dear ${name}, Thank you for shopping with us. Your total billing amount is Rs. ${amount}. Regards, IIFEDC`,
          `91${phone}`,
          process.env.DLT_TEPLATE_ID,
          process.env.REGISTRATION_ID
        )
       }
       catch(e){
        
       }
     
      // Send success response
      return res.status(201).json({ message: "Bill created successfully!", id: result.insertId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
    }

  } else if (req.method === 'GET') {
    // Handle fetching all bills with pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 5; // Default to 5 bills per page
    const offset = (page - 1) * limit;

    try {
      // Connect to MySQL database
      const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST, // Replace with your DB host
        user: process.env.MYSQL_USER, // Replace with your DB user
        password: process.env.MYSQL_PWD, // Replace with your DB password
        database: process.env.MYSQL_DB, // Replace with your DB name
      });

      // Fetch total number of bills
      const [totalBills] = await connection.query('SELECT COUNT(*) AS total FROM bills');
      const total = totalBills[0].total;

      // Fetch paginated bills
      const [bills] = await connection.query('SELECT * FROM bills ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);

      // Close the connection
      await connection.end();

      return res.status(200).json({
        bills,
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed." });
  }
}
