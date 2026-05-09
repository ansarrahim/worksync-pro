export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body || {};

  console.log("LOGIN REQUEST:", email);

  // SIMPLE FIXED USER (NO DB)
  const user = {
    email: "admin@test.com",
    password: "123456"
  };

  if (email === user.email && password === user.password) {
    return res.status(200).json({
      success: true,
      user: {
        email
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials"
  });
}