import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEmail,
  IsIn,
  Matches,
} from 'class-validator';

export class CreateCustomizationDto {
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  @MaxLength(150, { message: 'Customer name cannot exceed 150 characters' })
  customerName: string;

  @IsString()
  @IsNotEmpty({ message: 'Customer phone number is required' })
  @MaxLength(50, { message: 'Phone number cannot exceed 50 characters' })
  customerPhone: string;

  @IsString()
  @IsNotEmpty({ message: 'Email address is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(150, { message: 'Email address cannot exceed 150 characters' })
  customerEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Delivery address is required' })
  @MaxLength(500, { message: 'Address cannot exceed 500 characters' })
  customerAddress: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Preferred size cannot exceed 100 characters' })
  preferredSize?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Preferred color cannot exceed 100 characters' })
  preferredColor?: string;

  @IsString()
  @IsNotEmpty({ message: 'Description of custom requirements is required' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Reference image URL cannot exceed 500 characters' })
  @Matches(/^(\/uploads\/|https?:\/\/)/i, {
    message: 'Reference image must be an internal upload (/uploads/...) or safe HTTPS URL',
  })
  referenceImage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Estimated budget cannot exceed 100 characters' })
  estimatedBudget?: string;
}

export class UpdateCustomizationStatusDto {
  @IsString()
  @IsOptional()
  @IsIn(['pending', 'contacted', 'in_progress', 'completed', 'cancelled'], {
    message: 'Status must be one of: pending, contacted, in_progress, completed, cancelled',
  })
  status?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'Admin notes cannot exceed 5000 characters' })
  adminNotes?: string;
}

