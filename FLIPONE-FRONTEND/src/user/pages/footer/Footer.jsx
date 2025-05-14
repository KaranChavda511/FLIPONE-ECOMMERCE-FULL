import { Box, Typography, TextField, Button, Grid, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: "#000", color: "#fff", px: { xs: 2, md: 6 }, py: { xs: 4, md: 6 } }}>
      <Grid container spacing={8}>
        {/* Column 1: Newsletter */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: "14px", md: "16px" } }}
          >
            SIGN UP TO GET 10% OFF YOUR FIRST ORDER
          </Typography>
          <Typography sx={{ fontSize: "14px", mb: 3 }}>
            Stay up to date on the latest product releases, special offers and news.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: "300px" }}>
            <TextField
              placeholder="Your Email *"
              variant="outlined"
              sx={{
                input: { color: "#fff" },
                "& fieldset": { borderColor: "#fff" },
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#444",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#666" },
              }}
            >
              SUBSCRIBE
            </Button>
          </Box>
        </Grid>

        {/* Column 2: Shop Links */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: "14px", md: "16px" } }}
          >
            SHOP
          </Typography>
          {[
            "FAQ",
            "Shipping",
            "Returns",
            "Careers",
            "Terms & Conditions",
            "Privacy Policy",
          ].map((text) => (
            <Typography key={text} sx={{ mb: 1 }}>
              <Link href="#" underline="hover" color="inherit">
                {text}
              </Link>
            </Typography>
          ))}
        </Grid>

        {/* Column 3: Contact Info */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: "14px", md: "16px" } }}
          >
            CUSTOMER SERVICE
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>MONDAY - FRIDAY:</strong> 10:00–6:00 PM
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>PHONE:</strong> +1 712-339-9294
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>EMAIL:</strong> INFO@MODERNO-THEME.COM
          </Typography>
          <Typography>
            <strong>ADDRESS:</strong> 283 N. GLENWOOD STREET, LEVITTOWN, NY
          </Typography>
        </Grid>
      </Grid>

      {/* Sell on Moderno Button */}
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Button
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "#fff",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#fff",
              color: "#000",
            },
          }}
          onClick={() => navigate("/Selar_Registrastion")}
        >
          SELL ON MODERNO
        </Button>
      </Box>
    </Box>
  );
}
