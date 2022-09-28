import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Image {
  @Prop({ trim: true, default: null })
  image_path: string;
}
export const ImageSchema = SchemaFactory.createForClass(Image);
