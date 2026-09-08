from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import date

class BaseAAProvider(ABC):
    """
    Abstract Base Class for India's Account Aggregator (AA) Framework Provider.
    CredBridge acts as a Financial Information User (FIU) requesting authorized data from AA.
    """

    @abstractmethod
    def create_consent_request(
        self,
        worker_id: str,
        purpose: str,
        data_types: List[str],
        date_range: Dict[str, Optional[date]]
    ) -> Dict[str, Any]:
        """
        Creates an electronic consent artifact request with the Account Aggregator.
        """
        pass

    @abstractmethod
    def fetch_linked_accounts(self, worker_id: str) -> List[Dict[str, Any]]:
        """
        Discovers linked bank accounts (FIPs) authorized under the worker's AA handle.
        Never returns full account numbers - returns masked accounts only.
        """
        pass

    @abstractmethod
    def fetch_financial_data(
        self,
        consent_id: str,
        account_ids: List[str],
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves authorized financial statement/transaction data through Account Aggregator.
        Strictly applies the date filter requested by the worker.
        """
        pass
