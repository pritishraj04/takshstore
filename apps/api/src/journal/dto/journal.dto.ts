export class CreateJournalDto {
  title: string;
  slug: string;
  coverImage?: string;
  excerpt?: string;
  content: string;
  isPublished?: boolean;
}

export class UpdateJournalDto {
  title?: string;
  slug?: string;
  coverImage?: string;
  excerpt?: string;
  content?: string;
  isPublished?: boolean;
}
