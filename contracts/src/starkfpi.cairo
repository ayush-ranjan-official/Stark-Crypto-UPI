use starknet::{ContractAddress, get_caller_address};
use pragma_lib::abi::{IPragmaABIDispatcher, IPragmaABIDispatcherTrait};
use pragma_lib::types::{AggregationMode, DataType, PragmaPricesResponse};
use openzeppelin_access::ownable::OwnableComponent;

#[starknet::interface]
trait IERC20 {
    fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u128) -> bool;
    fn transfer_from(ref self: ContractState, sender: ContractAddress, recipient: ContractAddress, amount: u128) -> bool;
    fn approve(ref self: ContractState, spender: ContractAddress, amount: u128) -> bool;
    fn balance_of(self: @ContractState, account: ContractAddress) -> u128;
}

#[starknet::interface]
trait IStarkFPI {
    fn create_intent(ref self: ContractState, intent_amount: u128, upi_id: felt252) -> bool;
    fn validate_quote(self: @ContractState, foreigner: ContractAddress, intent_amount: u128, quote_amount: u128) -> bool;
    fn get_token_equivalent(self: @ContractState, inr_amount: u128) -> u128;
    fn process_payment(ref self: ContractState, foreigner: ContractAddress, solver: ContractAddress, amount: u128) -> bool;
    fn update_pragma_oracle(ref self: ContractState, new_address: ContractAddress);
    fn update_token_contract(ref self: ContractState, new_address: ContractAddress);
}

#[starknet::contract]
mod StarkFPI {
    use super::{
        ContractAddress, get_caller_address, IERC20Dispatcher,
        IPragmaABIDispatcher, AggregationMode, DataType, PragmaPricesResponse,
        OwnableComponent, IStarkFPI
    };

    // Components
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // Constants
    const MAX_MARKUP_PERCENTAGE: u128 = 140; // 1.4x maximum markup
    const INR_USD_PAIR: felt252 = 'INR/USD';
    const DECIMALS: u128 = 1_000_000; // 6 decimals for price precision

    #[storage]
    struct Storage {
        pragma_oracle: ContractAddress,
        token_contract: ContractAddress,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        OwnableEvent: OwnableComponent::Event,
        IntentCreated: IntentCreated,
        QuoteSubmitted: QuoteSubmitted,
        PaymentProcessed: PaymentProcessed
    }

    #[derive(Drop, starknet::Event)]
    struct IntentCreated {
        #[key]
        foreigner: ContractAddress,
        intent_amount: u128,
        upi_id: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct QuoteSubmitted {
        #[key]
        solver: ContractAddress,
        #[key]
        foreigner: ContractAddress,
        quote_amount: u128,
        is_valid: bool
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentProcessed {
        #[key]
        foreigner: ContractAddress,
        #[key]
        solver: ContractAddress,
        inr_amount: u128,
        token_amount: u128
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        pragma_address: ContractAddress,
        token_address: ContractAddress,
        owner: ContractAddress
    ) {
        self.pragma_oracle.write(pragma_address);
        self.token_contract.write(token_address);
        self.ownable.initializer(owner);
    }

    #[external(v0)]
    impl StarkFPIImpl of super::IStarkFPI {
        fn create_intent(
            ref self: ContractState,
            intent_amount: u128,
            upi_id: felt252
        ) -> bool {
            let foreigner = get_caller_address();
            
            self.emit(Event::IntentCreated(
                IntentCreated {
                    foreigner,
                    intent_amount,
                    upi_id
                }
            ));

            true
        }

        fn validate_quote(
            self: @ContractState,
            foreigner: ContractAddress,
            intent_amount: u128,
            quote_amount: u128
        ) -> bool {
            let max_allowed = (intent_amount * MAX_MARKUP_PERCENTAGE) / 100;
            let is_valid = quote_amount <= max_allowed;

            let solver = get_caller_address();
            
            self.emit(Event::QuoteSubmitted(
                QuoteSubmitted {
                    solver,
                    foreigner,
                    quote_amount,
                    is_valid
                }
            ));

            is_valid
        }

        fn get_token_equivalent(
            self: @ContractState,
            inr_amount: u128
        ) -> u128 {
            let oracle = IPragmaABIDispatcher {
                contract_address: self.pragma_oracle.read()
            };

            let price_data = oracle.get_data(
                DataType::SpotEntry(INR_USD_PAIR),
                AggregationMode::Median(())
            );

            (inr_amount * price_data.price) / DECIMALS
        }

        fn process_payment(
            ref self: ContractState,
            foreigner: ContractAddress,
            solver: ContractAddress,
            amount: u128
        ) -> bool {
            let token_amount = self.get_token_equivalent(amount);
            
            let token = IERC20Dispatcher {
                contract_address: self.token_contract.read()
            };
            
            let success = token.transfer_from(
                foreigner,
                solver,
                token_amount
            );

            self.emit(Event::PaymentProcessed(
                PaymentProcessed {
                    foreigner,
                    solver,
                    inr_amount: amount,
                    token_amount
                }
            ));

            success
        }

        fn update_pragma_oracle(
            ref self: ContractState,
            new_address: ContractAddress
        ) {
            self.ownable.assert_only_owner();
            self.pragma_oracle.write(new_address);
        }

        fn update_token_contract(
            ref self: ContractState,
            new_address: ContractAddress
        ) {
            self.ownable.assert_only_owner();
            self.token_contract.write(new_address);
        }
    }
}