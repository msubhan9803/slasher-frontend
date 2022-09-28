import {
  Controller, HttpStatus, ParseFilePipeBuilder, Post, Req, UploadedFile, UseInterceptors, Body, UploadedFiles
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
// import { S3StorageService } from '../local-storage/providers/s3-storage.service';
// import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { getUserFromRequest } from '../utils/request-utils';
// import { FeedPostsService } from './providers/feed-post.service';
import { CreateOrUpdateFeedPostDto } from './dto/create-or-update-feed-post.dto';

@Controller('feed-post')
export class FeedPostsController {
  constructor(
    // private readonly feedPostsService: FeedPostsService,
    // private readonly config: ConfigService,
    // private readonly localStorageService: LocalStorageService,
    // private readonly s3StorageService: S3StorageService,
  ) { }

  @Post('upload')
  // @UseInterceptors(FilesInterceptor('files'))
  @UseInterceptors(
    FilesInterceptor('files', 4, {
      dest: './upload',
      // fileFilter: ,
      limits: {
        fileSize: 200 * 10 ** 6,
      },
    }),
  )
  async uploadFile(
    @Req() request: Request,
    @Body() createOrUpdateFeedPostDto: CreateOrUpdateFeedPostDto,
    @UploadedFiles(
      // new ParseFilePipeBuilder()
      //   .addFileTypeValidator({
      //     fileType: /(jpg|jpeg|png)$/,
      //   })
      //   .addMaxSizeValidator({
      //     maxSize: 2e+7,
      //   })
      //   .build({
      //     errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      //   }),
    )
    files: Array<Express.Multer.File>,
    // files: Express.Multer.File[],
  ) {
    // console.log("file");
    const user = getUserFromRequest(request);
    const storageLocation = `/profile/profile`;
    console.log("file", files);
    console.log("message", createOrUpdateFeedPostDto.message);
    console.log("images", createOrUpdateFeedPostDto.images);
    const response = [];
    files.forEach(file => {
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
      };
      response.push(fileReponse);
    });
    return response;
    // const storageLocation = `/profile/profile_${file.filename}`;

    // if (this.config.get<string>('FILE_STORAGE') === 's3') {
    //   await this.s3StorageService.write(storageLocation, file);
    // } else {
    //   this.localStorageService.write(storageLocation, file);
    // }

    // user.profilePic = storageLocation;
    // await user.save();

    // Delete original upload
    // await fs.unlinkSync(file.path);
    // return { success: true };
  }

  // @Post('upload')
  // @UseInterceptors(FilesInterceptor('files'))
  // uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
  //   console.log(files);
  // }

  // const imageFileFilter = (req, file, callback) => {
  //   if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
  //     return callback(new Error('Only image files are allowed!'), false);
  //   }
  //   callback(null, true);
  // };

}
