import { Injectable } from '@angular/core';
import { ClientStateService } from '../client-state-service/client-state.service';
import { RatingQuestionsListStateService } from '../../../rating-questions-list/services/rating-questions-list-state/rating-questions-list-state.service';
import { LinkedServicesService } from '../linkservice/linked-services.service';

import { ServiceProvidersStateService } from '../../../service-provider/service-providers/services/service-providers-state/service-providers-state.service';
import { UsersStateService } from '../../../users/services/users-state/users-state.service';
import { Client } from '../../models/Client';
import { LinkedDocumentsService } from '../linkdocumetns/link-documents.service';

@Injectable({
  providedIn: 'root',
})
export class ClientSaveFacadeService {
  constructor(
    private clientState: ClientStateService,
    private ratingQuestionsState: RatingQuestionsListStateService,
    private servicesState: LinkedServicesService,
    private documentsState: LinkedDocumentsService,
    private serviceProvidersState: ServiceProvidersStateService,
    private usersState: UsersStateService
  ) {}

  // buildClientPayload(): Client {
  //   const clientDetails = this.clientState.getSnapshot().clientDetails[0]; // Assuming single client details
  //   return {
  //     ...clientDetails,
  //     ClientService: this.servicesState.currentServices.map((s) => ({
  //       ClientId: clientDetails.ClientId ?? 0,
  //       ServiceId: s.ServiceId!,
  //       Note: s.Note,
  //       TransferNumber: s.NotePlain,
  //       ServiceDto: s,
  //     })),
  //     ClientServiceProvider: this.serviceProvidersState
  //       .getLinkedProviders()
  //       .map((p) => ({
  //         ClientId: clientDetails.ClientId ?? 0,
  //         ServiceProviderId: p.ServiceProviderId ?? 0,
  //         ClientServiceProviderDto: p,
  //       })),
  //     ClientRatingQuestion: this.ratingQuestionsState
  //       .getRatingQuestions()
  //       .map((q) => ({
  //         ClientId: clientDetails.ClientId ?? 0,
  //         RatingQuestionId: q.RatingQuestionId!,
  //         ListRank: q.ListRank,
  //         IsDeleted: q.IsDeleted ?? false,
  //         RatingQuestion: q,
  //       })),
  //     ClientDocument: this.documentsState.currentDocuments.map((d) => ({
  //       ClientId: clientDetails.ClientId ?? 0,
  //       DocumentId: d.DocumentId!,
  //       Note: d.Description,
  //       FileData: d.FileUrl ?? '',
  //       FileName: d.FileName ?? '',
  //       ListRank: d.ListRank ?? 0,
  //       IsDeleted: false,
  //       Document: d,
  //     })),
  //     ClientClaimController: this.usersState.getUsers().map((u) => ({
  //       ClientId: clientDetails.ClientId ?? 0,
  //       UserId: u.Id!,
  //       IsDeleted: false,
  //       User: u,
  //     })),
  //     ClientClaimCentre: this.clientState
  //       .getSnapshot()
  //       .claimCentre.map((c) => ({
  //         ClientId: clientDetails.ClientId ?? 0,
  //         ClaimCentreId: c.ClaimCentreId!,
  //         ClaimCentre: c,
  //       })),
  //   };
  // }
}
