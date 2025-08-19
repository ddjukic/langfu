import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the extraction belongs to the user
    const extraction = await prisma.webExtraction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!extraction) {
      return NextResponse.json({ error: 'Extraction not found' }, { status: 404 });
    }

    // Delete the extraction (this will cascade delete extractedWords due to the relation)
    await prisma.webExtraction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete extraction error:', error);
    return NextResponse.json({ error: 'Failed to delete extraction' }, { status: 500 });
  }
}
