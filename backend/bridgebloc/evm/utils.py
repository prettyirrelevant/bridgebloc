from eth_utils import is_address, to_bytes, to_checksum_address, to_hex


def evm_address_to_bytes32(address: str) -> bytes:
    address = to_checksum_address(address)
    return b'\x00' * 12 + to_bytes(hexstr=address)


def bytes32_to_evm_address(value: bytes) -> str:
    if len(value) != 32 or not all(b == 0 for b in value[:12]):  # noqa: PLR2004
        raise ValueError('Invalid bytes32 format for an EVM address')

    address = to_hex(value[12:])
    if not is_address(address):
        raise ValueError('Invalid EVM address')

    return to_checksum_address(address)
