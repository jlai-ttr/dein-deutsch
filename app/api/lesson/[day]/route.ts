import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { day: string } }
) {
  const day = parseInt(params.day);
  if (isNaN(day) || day < 1 || day > 730) {
    return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
  }

  const filePath = path.join(
    'C:',
    'Users',
    'user',
    '.openclaw',
    'workspace-dialga',
    'scripts',
    `german_day${day}.txt`
  );

  try {
    const content = await readFile(filePath, 'utf-8');
    return NextResponse.json({ day, content });
  } catch (e) {
    return NextResponse.json(
      { day, content: `Tag ${day} ist noch nicht geschrieben. Dialga fügt es bald hinzu!` },
      { status: 200 }
    );
  }
}
