import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class FirstRunSetupDto {
  @IsString()
  @IsNotEmpty({ message: 'Administrator full name is required' })
  @MinLength(2, { message: 'Administrator full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Administrator full name cannot exceed 100 characters' })
  @Matches(/^[\p{L}\p{M}\s.'-]+$/u, {
    message: 'Administrator name contains invalid characters. Only letters, spaces, hyphens, and periods are allowed.',
  })
  name: string;

  @IsEmail({}, { message: 'A valid administrator email address is required' })
  @MaxLength(150, { message: 'Email address cannot exceed 150 characters' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Administrator phone number is required' })
  @MaxLength(30, { message: 'Phone number cannot exceed 30 characters' })
  @Matches(/^[0-9+()-\s]{7,25}$/, {
    message: 'Please enter a valid phone number',
  })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Store or brand name is required' })
  @MinLength(2, { message: 'Store name must be at least 2 characters' })
  @MaxLength(100, { message: 'Store name cannot exceed 100 characters' })
  @Matches(/^[^<>]+$/, { message: 'Store name cannot contain angle brackets or HTML tags' })
  store_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Website title is required' })
  @MinLength(3, { message: 'Website title must be at least 3 characters' })
  @MaxLength(150, { message: 'Website title cannot exceed 150 characters' })
  @Matches(/^[^<>]+$/, { message: 'Website title cannot contain angle brackets or HTML tags' })
  site_title: string;

  @IsString()
  @IsNotEmpty({ message: 'Support contact phone number is required' })
  @MaxLength(30, { message: 'Support phone number cannot exceed 30 characters' })
  @Matches(/^[0-9+()-\s]{7,25}$/, {
    message: 'Please enter a valid support phone number',
  })
  contact_phone: string;

  @IsEmail({}, { message: 'A valid support contact email address is required' })
  @MaxLength(150, { message: 'Support email cannot exceed 150 characters' })
  contact_email: string;

  @IsString()
  @IsNotEmpty({ message: 'Inside Dhaka delivery charge is required' })
  @MaxLength(10, { message: 'Delivery charge cannot exceed 10 characters' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Inside Dhaka delivery charge must be a valid non-negative number',
  })
  delivery_charge_dhaka: string;

  @IsString()
  @IsNotEmpty({ message: 'Outside Dhaka delivery charge is required' })
  @MaxLength(10, { message: 'Delivery charge cannot exceed 10 characters' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Outside Dhaka delivery charge must be a valid non-negative number',
  })
  delivery_charge_outside: string;
}
