import fs from 'fs';
import https from 'https';
import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Certificado base64 do .env
    const certificadoBase64 = process.env.PIX_CERTIFICADO;

    if (!certificadoBase64) {
      return res.status(400).json({ error: 'Certificado não encontrado no .env' });
    }

    const certificadoBuffer = Buffer.from(certificadoBase64, 'base64');

    const httpsAgent = new https.Agent({
      pfx: certificadoBuffer,
      passphrase: '', // coloque a senha aqui se seu .p12 tiver senha
    });

    const authHeader =
      'Basic ' +
      Buffer.from(`${process.env.PIX_CLIENT_ID}:${process.env.PIX_SECRET_KEY}`).toString('base64');

    const response = await axios.post(
      'https://pix-h.api.efipay.com.br/oauth/token',
      { grant_type: 'client_credentials' },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        httpsAgent,
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.response?.data || err.message || 'Erro desconhecido',
    });
  }
}
