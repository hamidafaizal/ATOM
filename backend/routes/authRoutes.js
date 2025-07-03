import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, encryptToken, generateJwt } from '../services/securityService.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { generateNumericToken } from '../utils/tokenGenerator.js';
import { startBotForUser } from '../services/botManager.js'; // DITAMBAHKAN

const router = Router();
const prisma = new PrismaClient();

// Endpoint /register tidak berubah
router.post('/register', async (req, res) => {
  const { namaPerusahaan, email, password, botToken } = req.body;

  if (!namaPerusahaan || !email || !password || !botToken) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain.' });
    }

    const hashedPassword = await hashPassword(password);
    const { iv, encryptedData } = encryptToken(botToken);
    const verificationToken = generateNumericToken(6);

    await prisma.user.create({
      data: {
        namaPerusahaan,
        email,
        password: hashedPassword,
        botToken: encryptedData,
        botTokenIv: iv,
        emailVerificationToken: verificationToken,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Registrasi berhasil. Silakan cek email Anda untuk kode verifikasi.' });
  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});


/**
 * Endpoint untuk verifikasi email.
 * POST /api/auth/verify-email
 */
router.post('/verify-email', async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token) {
        return res.status(400).json({ message: 'Email dan token verifikasi wajib diisi.' });
    }

    try {
        const user = await prisma.user.findFirst({ 
            where: { 
                email: email,
                emailVerificationToken: token 
            } 
        });

        if (!user) {
            return res.status(400).json({ message: 'Token verifikasi tidak valid atau salah.' });
        }
        
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                emailVerifiedAt: new Date(),
                emailVerificationToken: null,
            },
        });

        // =================================================================
        // === PERBAIKAN: Langsung nyalakan bot setelah verifikasi sukses ===
        // =================================================================
        startBotForUser(updatedUser);

        res.status(200).json({ message: 'Verifikasi email berhasil. Anda sekarang bisa login.' });

    } catch (error) {
        console.error('Error saat verifikasi email:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});


// Endpoint /login tidak berubah
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Email atau password salah.' });
        }

        if (!user.emailVerifiedAt) {
            return res.status(403).json({ message: 'Email belum diverifikasi. Silakan cek email Anda.' });
        }

        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const token = generateJwt({
            id: user.id,
            email: user.email,
            namaPerusahaan: user.namaPerusahaan,
        });
        
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                namaPerusahaan: user.namaPerusahaan,
            },
        });

    } catch (error) {
        console.error('Error saat login:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

export default router;
