import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/auth';
import { UserService } from '@/backend/services/userService';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { currentPassword, newPassword } = await req.json();

      // Validation
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Mot de passe actuel et nouveau mot de passe requis' } 
          },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' } 
          },
          { status: 400 }
        );
      }

      const user = req.user;
      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Utilisateur non trouvé' } 
          },
          { status: 404 }
        );
      }

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await AuthService.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Mot de passe actuel incorrect' } 
          },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await AuthService.hashPassword(newPassword);

      // Update password in database
      await UserService.updatePassword(user.id, hashedNewPassword);

      return NextResponse.json({
        success: true,
        message: 'Mot de passe mis à jour avec succès'
      });

    } catch (error) {
      console.error('Change password error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Erreur interne du serveur' } 
        },
        { status: 500 }
      );
    }
  });
}
