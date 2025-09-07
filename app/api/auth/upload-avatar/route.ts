import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/auth';
import { UserService } from '@/backend/services/userService';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const formData = await req.formData();
      const file = formData.get('avatar') as File;

      if (!file) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Aucun fichier fourni' } 
          },
          { status: 400 }
        );
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Le fichier doit être une image' } 
          },
          { status: 400 }
        );
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Le fichier ne peut pas dépasser 5MB' } 
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

      // Convert file to base64 for simple storage
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const dataURL = `data:${file.type};base64,${base64}`;

      // Update user avatar
      const updatedUser = await UserService.updateAvatar(user.id, dataURL);

      if (!updatedUser) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Erreur lors de la mise à jour de l\'avatar' } 
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          avatar: updatedUser.profile?.avatar
        },
        message: 'Photo de profil mise à jour avec succès'
      });

    } catch (error) {
      console.error('Upload avatar error:', error);
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
