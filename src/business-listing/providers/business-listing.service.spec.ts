import { Test, TestingModule } from '@nestjs/testing';
import { BusinessListingService } from './business-listing.service';

describe('BusinessListingService', () => {
  let service: BusinessListingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessListingService],
    }).compile();

    service = module.get<BusinessListingService>(BusinessListingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
