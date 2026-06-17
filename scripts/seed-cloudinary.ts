import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const imageAssets = {
  hero: "https://lh3.googleusercontent.com/aida/ADBb0ugo4YIXLtjoKUjhdcOlsywn3MCCxokAJWXJiQGHxYZmRLk0xHG1Vp1lwI47STNFDAm_WCluRxQw4qfZXRL4JlePoLus9T6MurssaLIjMroZne1BBCg0_rnrYMrC3C_gShW5nUzPjlmxwKS70WqZ09Zhx4v3wxRia998zFvtuq5i5e3Kozk0C3sWubZqnKZFKCAu5VR-drySRv2N6tg6XA92F25muBX4_kpW-dFNtjtHBVvnnhbp5TWeyWY",
  showroom: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmds4EmMLtCwrgVwda-oQKgqGCMniYwQ0P1gjB-VyrDhZtHJheZgB8tXL3d6MliF8cixUIZv2k7hLYfTFz34PR6S0LZzOYIhCN2TeDaBrejZUjymBFTAAXKiDTsAmqS5IXnaE69dKasSlPASKc7APJEHKCZHRu-9KuJqHnlW4Fp03VESztwq5tgmbhuNG8iyLnMqfqINhFDrBzon4GqbepwDfLRA8GK_jBeuQ3hFvELIT82JhcI1_RfrWlxyvUC2cFFACxTbOZRmA",
  woodWall: "https://lh3.googleusercontent.com/aida-public/AB6AXuAforj3VX-FTBvzBL9xk8xZsyRFeSrCTCZroaw5xiKiW94p97bHwS5p8v7NPz1CEkw5kcZcO8Qhg50HbSL08FWNepcJQvILK7uoRkp-yXAMFVWrODBkXn_ljL5x1r892Y4CCJK6PiLLH_ZVLw-_yvANxLy70jQTG3SyAkhvnKSHdiDphu2VvxBxS50kNU30Klji9hXESZM6sKB-BJixTEwUya_W-dPDnizTqnuvjBX-hpj088KerYWV3pBNhSzQ-mp6IaevUWw-Xg4",
  sofa: "https://lh3.googleusercontent.com/aida-public/AB6AXuDeNaFa3JY47GArzSxORvjQWIf13YpBq5rZYV_Vlg0WKN8i1K-riacPvEpxjgArG70R9OkqHw41H7xEEnVaMamTzu2j8lUK-wN10A784d1QoZHM4fi9vE9NsHXu1EneflVADtw0KiL5VYdZ-5MVbfL4kn3BaILk6D4iORdO7N2m089CpKpF2esGBi_yIxBC9B7XXStL7PKNX97Nil49w0dOvCjJzkSw6MopELonyTGhnooSPrfWnl3mqEpWOdLeuH6JKV3e8hIF1D4",
  texture: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2q3Ks_6pKPj_ztm3What2dEyztzDtNSvlZcUiPwDiHA_VOusUyXVgYS06-2m4NL9GmKNk3B-7rH9t1GULDEHPvcNX8oCCYUzEeQqXMpXWy4XEp2xsGc_sLEQkb0ZzpymPtbZIE4H8dBJCKulL4NFlX36FFSERPocr8VlgluZIYKCTL_3y35ErKcKsb6O845GEgb3D4JiGYGR4yVoCcOP5UqjQX6ecZiCoYMtFCPAqwW2qx1--TLUZKgOAER2eASmfDpbCWv09h0Q",
  room: "https://lh3.googleusercontent.com/aida-public/AB6AXuCS7rYc18dpXUFnhvwBuKvVucavZ1sAsE7DxMtRl_98ETvYOUVz44VpAURmwOHZ7J9HuYsw8sBH_O4uP1U_8G2qw0JOtoCI_dTrmqpw2kEsALwRtiBzM2XQx8aKxpcPVlMn34cMjlBmADgZhbyHjyZjYC20RChapDYZk1VETdbY4ce1PYH6BxZ9ILJakNNyTsFOL82tJQs_U_JfvrNJvYA0cgVpj1VZZOzglO4g_SsMvrcrb7dLAz4YUJlC3-e3y-ZwFnQg8bCrdFs",
  table: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9AqZgkazhLr1T0iK0v_7bDSJHoCTj3l7Bj1kVA10E3JGafT3Ac50zasCKjmT768HKPkLHAuydGJZJhcPgRtnx7_lmH_wPPkCksh-mWEU67Ei-yO7Ft71A-StpTV931Nc2YeU5FBCPPxTlj4Pl8A_0LKVIcc7hTjZMR4zKfqic1n1uqjBz3PkdQMMaP8FSpmyCTaPMjANwfzExqwt7upT3zcL8vw6xmL52Dy822UQXYQregnQUtL615QO5pxLjUKsEDFJonheQBL8",
  chair: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnx1hfaFuH9dONC9n1Zeb923X8H4PwlrC4W7qicSbstnJIprYGc-yR7OTxREuWnOcwx19UvIXMDCvg9zXcMwJF-lDkEUS5m5lJkPVNqZseRCrKR7FfBIudzCxH5fjqusPoXCUYY2EwjcEoZ-Aeb-a-8r1Kqki-uU5nhQRcUm8iN0km-hkRpo48wZyVz7iqNL2zdpArLdYJSfPSXbk_Pnc2lRac6tU7pZnY-tUD6pPAZoUnlna3OGi-8Jt2s2a6cX6mZdXUfzEpjiw",
  cabinet: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3B2R2wqvqxZ5Z9F5wnvqW9iRiZf4UcURAsxvhA7NMniGvGLWXgDtDGLt-f1tT1UrYVQSKbDBAnKku_suIAR7FmvTGXgr-wDcKxlM0rl_GiDaftq21U2qDqUVysviWH23buFJLYDENtMlm4tp5olOEmBsnb1WmqyFav5ZpKhQr1dYjTofBDoZbsqZ8cG9o9zWde__bE0H5Evrl0HXZYyi7UbVvKUTiGy4nNbDn6OqX_XVbFUdiK-BNiKxXWha12pDBQ7ptcVyLGMg",
  aboutHero: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2Pe1R0tdQejufPca-v8RZNnJrmfBROnC2Rli3Ap-j5XbDWDxfrqJnCwUIJFaPPnGNeS8zxX-J_eaWHPML-l2xOtmtnqbLpoMeiTdEKD4UCez2bHauAz1NzGRcd0AXQYCwah9GdEG3kjTGylOnLp5-PAcmObCbVD0iE4w4j6wUrs38E0GAahZAtoPYfoctPPWRQTJ4sRuqQ_T2zmWNktH8HF6UuiMIX5fPf8Y46zClHj0MCrw4xbhKolasMZa-Y3jfY-veo6EzICM",
  factory: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHgmvTjl-N6rQdQXM9ZKG9VA2j6kVB7kIL-ktEggsK3p0r_l29whxxw90CSBDSHdME7KUsmGOsY2uyBHVt25-7I5bZK27g9luU3tqL_uqgJmAY6ojKpMGEfxBAKEeiuJZw5Cw4oxe9znmzvLoyH-NRKp7cvFnVYeHOfsHTD3Uc7Idy-JHaxVaASjoo0sFvQOl5kNblkEMQtceC2OzVGwhVT0pZp9r00eZOeFL_iw36yLkB-umowwmwjchYmw7xjKFBTCNc2WNeK3s",
  blog1: "https://lh3.googleusercontent.com/aida-public/AB6AXuDS37ogl_A-pJSG7Rs7CG2CVV3nR6iVnbjUPlrSgc4sy5tGrxHiVxN63GtuhWlqm_2jrnZ8b5lh6GEfl1EnGAxmtb-RfRAGhurKL3au-oZrdjJefVAZhO1XeX6BirruL8uMMRrk0w_qOm_38DR6zkFogxTQxlsAksF_pqVb8c0j7-eRqx_N6X3PVI3GT3l5o9RNR0ub9ZJPgeUV0T48yrnB5U-F921QZ6YQwlxCQ5SV3KP16eS8qbsncJc0bOQPiBnLxbhbsYiEKkA",
  blog2: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpdlBG3oOmLlm4MxeICx-_posDDjBMKRxVkEGLpIYvctU2Y1CSdKWx7Sb02kTksn-tiqDCcpkts05NxdtILMpa4u8kp2hV34kIUHrxROPXtzFGsKZdVLBfPkfMpjpONpj8xtGReXYY2I287ShXtoKYRv6s7j6ytsm36AJM4eVXVdkW1pJ4DEvEEY426EScKm-QFmniPeMwspEOqrHf_iySdko9_rhYgkUi_7jzvgzKoR31tsWhuu1yj41rrLORwU6QDlFK8qQE1eU",
  showroom2: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGAhI1CAiX95UHBqLh0tZtdI-dfrQIHKISIE0IuRwkFA7njjsMNj0Qb2k-uy9rLB__VSHEurjbbpo-jaXKzmYqEWYViLOngpLUBGYdY0wHYiAsWz6Z5onVyCfGfxMqUIMiDIwsZZ9RdoovaqVSR4nqL4CsS9fe9p2GwNqpvGfWK-M9BHs-7aqKV5DbCTJY1_Z1MXn1WXRWOnZyinevxlaOn6R04B3zVU9GcgjL183V7yVNe7dJMvJv0SUi4vBR5inp06MVVAhrhy8",
};

// Check if credentials are present
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "showroom";

const hasCredentials = !!(cloudName && apiKey && apiSecret);

if (hasCredentials) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log("Cloudinary initialized successfully with server credentials.");
} else {
  console.warn("Cloudinary credentials missing in .env. Falling back to mock URL generation.");
}

async function run() {
  const mapping: Record<string, string> = {};

  for (const [key, sourceUrl] of Object.entries(imageAssets)) {
    console.log(`Processing image '${key}'...`);
    if (hasCredentials) {
      try {
        const result = await cloudinary.uploader.upload(sourceUrl, {
          folder,
          public_id: key,
          overwrite: true,
          resource_type: "image",
        });
        console.log(`Uploaded '${key}' successfully: ${result.secure_url}`);
        mapping[key] = result.secure_url;
      } catch (err) {
        console.error(`Failed to upload '${key}' to Cloudinary:`, err);
        // Fallback to mock url format
        const fallbackUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1234567890/${folder}/${key}.jpg`;
        console.log(`Falling back for '${key}': ${fallbackUrl}`);
        mapping[key] = fallbackUrl;
      }
    } else {
      const fallbackUrl = `https://res.cloudinary.com/${cloudName || "demo"}/image/upload/v1234567890/${folder}/${key}.jpg`;
      mapping[key] = fallbackUrl;
    }
  }

  // Write mapping
  const outputPath = path.join(process.cwd(), "scripts", "cloudinary-mapping.json");
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2), "utf8");
  console.log(`Successfully saved Cloudinary image mapping to ${outputPath}`);
}

run().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
