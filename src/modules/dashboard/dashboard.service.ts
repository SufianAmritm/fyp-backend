import { Inject, Injectable } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';
import {
  EMPLOYEE_VERIFICATION_STATUS,
  OCCUPATION_STATUS,
} from '../../common/constants/enums';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { AppContext } from '../../common/interfaces/context';
import { IApartmentRepository } from '../apartment/repositories/interface/apartment-repository.interface';
import { IApplicationRepository } from '../applications/repositories/interface/applications-repository.interface';
import { IColonyRepository } from '../colony/repositories/interface/colony-repository.interface';
import { IDivisionRepository } from '../division/repositories/interface/division-repository.interface';
import { IEmployeeVerificationRepository } from '../employee-verification/repositories/interface/employee-verification-repository.interface';
import { Employee } from '../employee/entities/employee.entity';
import { IEmployeeRepository } from '../employee/repositories/interface/employee-repository.interface';
import { IManagersRepository } from '../managers/repositories/interface/managers-repository.interface';
import { ITransferRequestRepository } from '../occupations/repositories/interface/transfer-request-repository.interface';
import { IVacancyRequestRepository } from '../occupations/repositories/interface/vacancy-requests-repository.interface';
import { IStationRepository } from '../station/repositories/interface/station-repository.interface';
import { IDashboardService } from './interfaces/dashboard.interface';

@Injectable()
export class DashboardService implements IDashboardService {
  constructor(
    @Inject(IDivisionRepository)
    private readonly divisionRepository: IDivisionRepository,
    @Inject(IStationRepository)
    private readonly stationRepository: IStationRepository,
    @Inject(IColonyRepository)
    private readonly colonyRepository: IColonyRepository,
    @Inject(IEmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository,
    @Inject(IApartmentRepository)
    private readonly apartmentRepository: IApartmentRepository,
    @Inject(IManagersRepository)
    private readonly managerRepository: IManagersRepository,
    @Inject(IVacancyRequestRepository)
    private readonly vacancyRequestRepository: IVacancyRequestRepository,
    @Inject(ITransferRequestRepository)
    private readonly transferRequestRepository: ITransferRequestRepository,
    @Inject(IApplicationRepository)
    private readonly applicationRepository: IApplicationRepository,
    @Inject(IEmployeeVerificationRepository)
    private readonly employeeVerificationRepository: IEmployeeVerificationRepository,
  ) {}

  async adminDashboard() {
    const [
      divisions,
      stations,
      colonies,
      apartments,
      employees,
      managers,
      newEmployeesThisWeek,
      vacancies,
      transfers,
      applications,
      verifications,
      colonyOccupationPercents,
      newApplicationsToday,
      newVacancyRequestsToday,
      newTransferRequestsToday,

      newEmployeeVerificationRequestsToday,
    ] = await Promise.all([
      this.divisionRepository.count({}),
      this.stationRepository.count({}),
      this.colonyRepository.count({}),
      this.apartmentRepository.count({}),
      this.employeeRepository.count({}),
      this.managerRepository.count({}),
      this.employeeRepository.count({
        createdAt: MoreThanOrEqual(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ),
      }),
      this.vacancyRequestRepository.count({
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
      }),
      this.transferRequestRepository.count({
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
      }),
      this.applicationRepository.count({
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
      }),
      this.employeeVerificationRepository.count({
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
      }),
      await this.colonyRepository.callQuery(
        `select
        c.id as colony_id,
        c.name as colony_name,
        COUNT(a.id) as total_apartments,
        COUNT(o.id) filter (
        where o.status is distinct
      from
        '${OCCUPATION_STATUS.VACANT}') as occupied_apartments,
        ROUND(
          (COUNT(o.id) filter (
        where o.status is distinct
      from
        '${OCCUPATION_STATUS.VACANT}')::decimal / COUNT(a.id)) * 100,
        2
        ) as occupied_percent
      from
        colonies c
      join apartments a on
        a.colony_id = c.id
      left join occupations o on
        o.apartment_id = a.id
      group by
        c.id,
        c.name
      having
        (COUNT(o.id) filter (
        where o.status is distinct
      from
        '${OCCUPATION_STATUS.VACANT}')::decimal / COUNT(a.id)) * 100 >= 1;`,
      ),
      await this.applicationRepository.count({
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        createdAt: MoreThanOrEqual(
          new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        ),
      }),
      await this.vacancyRequestRepository.count({
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        createdAt: MoreThanOrEqual(
          new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        ),
      }),
      await this.transferRequestRepository.count({
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        createdAt: MoreThanOrEqual(
          new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        ),
      }),
      await this.employeeVerificationRepository.count({
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        createdAt: MoreThanOrEqual(
          new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        ),
      }),
    ]);
    return {
      divisions,
      stations,
      colonies,
      apartments,
      employees,
      managers,
      vacancies,
      transfers,
      applications,
      verifications,
      alerts: {
        colonyOccupationPercents:
          colonyOccupationPercents.length > 0 ? colonyOccupationPercents : [],
        newEmployeesThisWeek,
        newApplicationsToday,
        newVacancyRequestsToday,
        newTransferRequestsToday,

        newEmployeeVerificationRequestsToday,
      },
    };
  }

  async managerDashboard(context: AppContext) {
    const [
      divisions,
      stations,
      colonies,
      myApartments,
      myColonies,
      myEmployees,
      newEmployeesThisWeek,
      vacancies,
      transfers,
      applications,
      verifications,
      colonyOccupationPercents,
      newApplicationsToday,
      newVacancyRequestsToday,
      newTransferRequestsToday,
      newEmployeeVerificationRequestsToday,
    ] = await Promise.all([
      this.divisionRepository.count({}),
      this.stationRepository.count({}),
      this.colonyRepository.count({}),
      this.apartmentRepository.countMyApartments(context),
      this.colonyRepository.count({
        stationId: context.StationId,
      }),

      this.employeeRepository.countMyEmployees(context),
      this.employeeRepository.countMyNewEmployees(context),
      this.vacancyRequestRepository.countMyVacancyRequests(context),
      this.transferRequestRepository.countMyTransferRequests(context),
      this.applicationRepository.countMyApplications(context),
      this.employeeVerificationRepository.countMyVerifications(context),
      await this.colonyRepository.callQuery(
        `select
        c.id as colony_id,
        c.name as colony_name,
        COUNT(a.id) as total_apartments,
        COUNT(o.id) filter (
        where o.status is distinct
      from
        '${OCCUPATION_STATUS.VACANT}') as occupied_apartments,
        ROUND(
          (COUNT(o.id) filter (
        where o.status is distinct
      from
        '${OCCUPATION_STATUS.VACANT}')::decimal / COUNT(a.id)) * 100,
        2
        ) as occupied_percent
      from
        colonies c
      join apartments a on
        a.colony_id = c.id
      left join occupations o on
        o.apartment_id = a.id
      where c.station_id = $1
      group by
        c.id,
        c.name
      having
        (COUNT(o.id) filter (
        where o.status is distinct
      from
        '${OCCUPATION_STATUS.VACANT}')::decimal / COUNT(a.id)) * 100 >= 1;`,
        [context.StationId],
      ),
      await this.applicationRepository.countMyApplicationsNew(context),
      await this.vacancyRequestRepository.countMyVacancyRequestsNew(context),
      await this.transferRequestRepository.countMyTransferRequestsNew(context),
      await this.employeeVerificationRepository.count({
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        createdAt: MoreThanOrEqual(
          new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        ),
      }),
    ]);
    return {
      divisions,
      stations,
      colonies,
      myApartments,
      myColonies,
      myEmployees,
      vacancies,
      transfers,
      applications,
      verifications,
      alerts: {
        colonyOccupationPercents:
          colonyOccupationPercents.length > 0 ? colonyOccupationPercents : [],
        newEmployeesThisWeek,
        newApplicationsToday,
        newVacancyRequestsToday,
        newTransferRequestsToday,

        newEmployeeVerificationRequestsToday,
      },
    };
  }
  async employeeDashboard(context: AppContext) {
    const employee = await this.employeeRepository.findOneWithBuilderOption(
      new FindOptionsBuilder<Employee>()
        .where({ userId: context.UserId })
        .relations({
          colony: {
            station: { division: true },
          },
          occupations: {
            apartment: true,
          },
          transferRequests: true,
          vacancyRequests: true,
          applications: true,
          verification: true,
        })
        .build(),
    );
    const division = employee.colony.station.division;
    employee.colony.station.division = undefined;
    const station = employee.colony.station;
    employee.colony.station = undefined;
    const colony = employee.colony;
    employee.colony = undefined;
    return {
      division,
      station,
      colony,
      myApartment:
        employee.occupations.find(
          (a) => a.status === OCCUPATION_STATUS.OCCUPIED,
        )?.apartment || null,
      apartmentOccupiedOn:
        employee.occupations.find(
          (a) => a.status === OCCUPATION_STATUS.OCCUPIED,
        )?.lastOccupiedOn || null,
      lastTransferRequestStatus:
        employee.transferRequests.sort((a, b) => {
          return (
            new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime()
          );
        })[0]?.status || null,
      lastVacancyRequestStatus:
        employee.vacancyRequests.sort((a, b) => {
          return (
            new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime()
          );
        })[0]?.status || null,
      lastApplicationStatus:
        employee.applications.sort((a, b) => {
          return (
            new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime()
          );
        })[0]?.status || null,
      verificationStatus:
        employee.verification.sort((a, b) => {
          return (
            new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime()
          );
        })[0]?.status || null,
    };
  }
}
