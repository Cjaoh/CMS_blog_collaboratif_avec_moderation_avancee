import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole, UserStatus, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async create(createUserDto: any): Promise<UserDocument> {
    const { email, password, firstName, lastName, role = UserRole.AUTHOR } = createUserDto;

    // Vérifier si l'email existe déjà
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      role,
    });

    return user.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: any): Promise<UserDocument> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async incrementArticlesCount(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { $inc: { articlesCount: 1 } }).exec();
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async changeStatus(id: string, status: UserStatus): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, { status }, { new: true }).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async changeRole(id: string, role: UserRole): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getTopAuthors(): Promise<UserDocument[]> {
    return this.userModel
      .find({ status: UserStatus.ACTIVE })
      .sort({ articlesCount: -1 })
      .limit(10)
      .select('-password -refreshToken')
      .exec();
  }
}