import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReportAndUnreport, ReportAndUnreportDocument } from '../../schemas/reportAndUnreport/reportAndUnreport.schema';

@Injectable()
export class ReportAndUnreportService {
  constructor(
    @InjectModel(ReportAndUnreport.name)
    private reportAndUnreportModel: Model<ReportAndUnreportDocument>,
  ) { }

  async create(reportAndUnreport: Partial<ReportAndUnreport>) {
    return this.reportAndUnreportModel.create(reportAndUnreport);
  }
}
