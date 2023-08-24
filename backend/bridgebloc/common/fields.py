from typing import Any

from eth_typing import ChecksumAddress
from eth_utils.address import is_address, to_checksum_address

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Model

from bridgebloc.evm.types import ChainID


class EVMAddressField(models.CharField):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        kwargs['max_length'] = 42
        super().__init__(*args, **kwargs)

    def validate(self, value: Any, model_instance: Model | None) -> None:
        super().validate(value, model_instance)
        if not is_address(value):
            raise ValidationError('Invalid EVM address provided')

    def pre_save(self, model_instance: Model, add: bool) -> ChecksumAddress:  # noqa: FBT001
        if add:
            addr = getattr(model_instance, self.attname)
            checksum_addr = to_checksum_address(addr)
            setattr(model_instance, self.attname, checksum_addr)
            return checksum_addr

        return super().pre_save(model_instance, add)

    def formfield(
        self,
        form_class: Any | None = ...,  # noqa: ARG002
        choices_form_class: Any | None = ...,  # noqa: ARG002
        **kwargs: Any,
    ) -> Any:
        kwargs.update({'max_length': self.max_length})
        return super().formfield(**kwargs)


class EVMChainIDField(models.PositiveIntegerField):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        kwargs['validators'] = [MinValueValidator(1)]
        kwargs['choices'] = [(choice.value, choice.name.replace('_', ' ').title()) for choice in ChainID]
        super().__init__(*args, **kwargs)

    def from_db_value(self, value: Any, *args: Any) -> ChainID | None:  # noqa: ARG002
        if value is None:
            return value

        return ChainID(value)
